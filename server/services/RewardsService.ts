import { AxiosError } from 'axios'
import {
  CampaignsApi,
  Configuration,
  CreateOrderRequest,
  Environments,
  FieldsApi,
  ListRewards200Response,
  OrdersApi,
  RewardsApi,
} from 'tremendous'
import config from '../config'
import * as cache from '../cache'
import { logError } from '../logger'
import { Ulid, Uuid } from '../models/pgUtils'
import { isProductionEnvironment } from '../utils/environments'

const configuration = new Configuration({
  basePath: isProductionEnvironment()
    ? Environments.production
    : Environments.testflight,
  accessToken: config.tremendousApiKey,
})
const orders = new OrdersApi(configuration)
const fields = new FieldsApi(configuration)
const rewards = new RewardsApi(configuration)
const campaigns = new CampaignsApi(configuration)

enum CustomFieldLabels {
  // Tremendous campaign ID used for reward configuration on Tremendous
  TREMENDOUS_CAMPAIGN_ID = 'campaign_id',
  USER_ID = 'user_id',
  // Note: Do not confuse this with the Tremendous campaign ID.
  // IMPACT_STUDY_CAMPAIGN_ID refers specifically to the campaign ID used in the impact study survey.
  IMPACT_STUDY_CAMPAIGN_ID = 'impact_study_campaign_id',
  USER_ID_IMPACT_STUDY_CAMPAIGN_ID = 'user_id_impact_study_campaign_id',
}

type CUSTOM_FIELDS_IDS = {
  [CustomFieldLabels.TREMENDOUS_CAMPAIGN_ID]: string
  [CustomFieldLabels.USER_ID]: string
  [CustomFieldLabels.IMPACT_STUDY_CAMPAIGN_ID]: string
  [CustomFieldLabels.USER_ID_IMPACT_STUDY_CAMPAIGN_ID]: string
}

type CreateGiftCardReward = {
  userId: string
  name: string
  email: string
  amount: number
  tremendousCampaignId: string
  externalId?: string
  impactStudySurveyCampaignId?: string
}

type UserReward = {
  id: string
  rewardLink: string
  amount: number
  campaignId?: string | null
  campaignName?: string | null
  createdAt: Date
}

type RewardCampaigns = {
  [key: string]: {
    name: string
    description: string | null
  }
}

function isCustomFieldLabel(label: string): label is keyof CUSTOM_FIELDS_IDS {
  return Object.values(CustomFieldLabels).includes(label as CustomFieldLabels)
}

export async function getCustomFieldsIds(): Promise<
  CUSTOM_FIELDS_IDS | undefined
> {
  // TODO: Make a utility method for the pattern of retrieving from cache/fetching/storing into cache
  const cacheKey = 'tremendous-custom-fields'
  try {
    const cacheFields = await cache.get(cacheKey)
    return JSON.parse(cacheFields ?? {}) as CUSTOM_FIELDS_IDS
  } catch {
    // Ignore cache-related errors
  }

  try {
    const { data } = await fields.listFields()
    if (!data.fields || !Array.isArray(data.fields)) return

    const customFields: Partial<CUSTOM_FIELDS_IDS> = {}
    for (const field of data.fields) {
      if (field.label && isCustomFieldLabel(field.label))
        customFields[field.label] = field.id
    }
    await cache.saveWithExpiration(
      cacheKey,
      JSON.stringify(customFields),
      config.tremendousCustomFieldsCacheExpirationSeconds
    )
    return customFields as CUSTOM_FIELDS_IDS
  } catch (error) {
    throw error
  }
}

export async function createGiftCardRewardLink(data: CreateGiftCardReward) {
  try {
    const customFieldIds = await getCustomFieldsIds()
    const recipient = { name: data.name, email: data.email }
    const customFields = []

    /**
     *
     * We use compound custom fields to overcome Tremendous' API filtering limitations on
     * filtering on multiple custom fields.
     *
     */
    if (data.impactStudySurveyCampaignId) {
      customFields.push(
        {
          id: customFieldIds?.[
            CustomFieldLabels.USER_ID_IMPACT_STUDY_CAMPAIGN_ID
          ],
          value: getUserImpactCampaignFieldName(
            data.userId,
            data.impactStudySurveyCampaignId
          ),
        },
        {
          id: customFieldIds?.[CustomFieldLabels.IMPACT_STUDY_CAMPAIGN_ID],
          value: String(data.impactStudySurveyCampaignId),
        }
      )
    }

    const params: CreateOrderRequest = {
      payment: {
        funding_source_id: 'BALANCE',
      },
      external_id: data.externalId,
      reward: {
        delivery: {
          method: 'LINK',
        },
        recipient,
        value: {
          denomination: data.amount,
          currency_code: 'USD',
        },
        campaign_id: data.tremendousCampaignId,
        custom_fields: [
          {
            id: customFieldIds?.[CustomFieldLabels.USER_ID],
            value: data.userId,
          },
          {
            id: customFieldIds?.[CustomFieldLabels.TREMENDOUS_CAMPAIGN_ID],
            value: data.tremendousCampaignId,
          },
          ...customFields,
        ],
      },
    }

    const response = await orders.createOrder(params)
    const order = response.data.order

    let rewardLink
    if (order.rewards) rewardLink = order.rewards[0].delivery?.link
    return rewardLink
  } catch (error) {
    throw error
  }
}

export async function getCampaigns(): Promise<RewardCampaigns> {
  // TODO: Make a utility method for the pattern of retrieving from cache/fetching/storing into cache
  const cacheKey = 'tremendous-campaigns'
  try {
    const cachedCampaigns = await cache.get(cacheKey)
    if (cachedCampaigns) {
      return JSON.parse(cachedCampaigns) as RewardCampaigns
    }
  } catch (error) {
    // Ignore cache-related errors
  }

  const { data } = await campaigns.listCampaigns()
  const campaignData = {} as RewardCampaigns
  for (const campaign of data.campaigns) {
    if (!campaign.id) continue
    campaignData[campaign.id] = {
      name: campaign.name,
      description: campaign.description,
    }
  }

  try {
    await cache.saveWithExpiration(
      cacheKey,
      JSON.stringify(campaignData),
      config.tremendousCampaignCacheExpirationSeconds
    )
  } catch (error) {
    // Ignore cache-related errors
  }

  return campaignData
}

/**
 *
 * Due to Tremendous API limitations, when filtering by a custom field (e.g., user_id),
 * the API response only includes that field among custom_fields. Therefore, we must
 * retrieve each reward individually to obtain all associated custom fields.
 *
 * Additionally, we use caching to minimize API calls for subsequent page requests.
 *
 */
export async function getUserRewards(
  userId: Ulid,
  offset: number
): Promise<{ rewards: UserReward[]; total: number }> {
  // TODO: Make a utility method for the pattern of retrieving from cache/fetching/storing into cache
  try {
    const cacheKey = `user-rewards-${userId}`
    const userRewards: { rewards: UserReward[]; total: number } = {
      rewards: [],
      total: 0,
    }
    let userRewardResponse: ListRewards200Response | undefined

    // Attempt to retrieve cached rewards if this is not the first page.
    if (offset > 0) {
      try {
        const cachedResponse = await cache.get(cacheKey)
        if (cachedResponse) userRewardResponse = JSON.parse(cachedResponse)
      } catch (cacheError) {
        // Ignore cache-related errors
      }
    }

    if (!userRewardResponse || !userRewardResponse.rewards) {
      const { data } = await rewards.listRewards(undefined, {
        params: { [CustomFieldLabels.USER_ID]: userId, limit: 100 },
      })
      if (!data.rewards) return userRewards

      try {
        await cache.saveWithExpiration(cacheKey, JSON.stringify(data))
      } catch (error) {
        // Ignore cache-related errors
      }

      userRewardResponse = data
    }

    const REWARD_LIMIT_PER_PAGE = 4
    const paginatedRewards = userRewardResponse.rewards!.slice(
      offset,
      offset + REWARD_LIMIT_PER_PAGE
    )
    const rewardIds = paginatedRewards
      .filter((reward): reward is { id: string } => !!reward.id)
      .map((reward) => reward.id)

    /**
     *
     * Tremendous returns rewards filtered by a custom_field with only that field populated.
     * To retrieve all custom fields for each reward, we fetch the full reward data individually
     *
     */
    const rewardsData = await Promise.all(
      rewardIds.map((id) => getUserRewardByRewardId(id))
    )

    const allCampaigns = await getCampaigns()

    for (const reward of rewardsData) {
      if (!reward?.id || reward.delivery?.method !== 'LINK') continue
      const campaignId = reward.custom_fields?.find(
        (field) => field.label === CustomFieldLabels.TREMENDOUS_CAMPAIGN_ID
      )?.value
      const campaign =
        campaignId && allCampaigns[campaignId]
          ? allCampaigns[campaignId]
          : { name: 'No Campaign' }

      const rewardLink = await getRewardLink(reward.id)
      userRewards.rewards.push({
        id: reward.id,
        amount: reward.value?.denomination ?? 0,
        campaignId,
        campaignName: campaign.name,
        createdAt: new Date(reward.created_at!),
        rewardLink,
      })
    }
    userRewards.total = userRewardResponse.total_count ?? 0
    return userRewards
  } catch (error) {
    logError(
      ((error as AxiosError).response?.data as Error) || (error as Error)
    )
    throw error
  }
}

export async function getUserRewardByRewardId(rewardId: string) {
  const { data } = await rewards.getReward(rewardId)
  if (!data.reward) return
  return data.reward
}

export async function getRewardLink(rewardId: string) {
  // TODO: Make a utility method for the pattern of retrieving from cache/fetching/storing into cache
  const cacheKey = `reward-link-${rewardId}`

  let rewardLink: string | undefined
  try {
    rewardLink = await cache.get(cacheKey)
    if (rewardLink) return rewardLink
  } catch (error) {
    // Ignore cache-related errors
  }

  const { data } = await rewards.generateRewardLink(rewardId)
  rewardLink = data.reward.link ?? ''
  if (rewardLink) {
    try {
      await cache.saveWithExpiration(cacheKey, rewardLink)
    } catch (error) {
      // Ignore cache-related errors
    }
  }

  return rewardLink
}

/**
 *
 * Due to Tremendous API limitations on filtering by multiple custom fields,
 * we use a compound custom field (user_id_impact_study_campaign_id) to fetch rewards tied to both a user and an impact study campaign.
 * This allows us to determine if a user has already received a reward for a given impact study campaign.
 *
 */
export async function getUserRewardByImpactStudySurveyCampaignId(
  userId: Ulid,
  impactStudySurveyCampaignId: string
) {
  try {
    const response = await rewards.listRewards(undefined, {
      params: {
        [CustomFieldLabels.USER_ID_IMPACT_STUDY_CAMPAIGN_ID]:
          getUserImpactCampaignFieldName(userId, impactStudySurveyCampaignId),
      },
    })
    const { data } = response
    if (!data.rewards) return []
    else return data.rewards
  } catch (error) {
    logError(error as Error)
    return []
  }
}

function getUserImpactCampaignFieldName(
  userId: Uuid,
  impactStudySurveyCampaignId: string
) {
  return `${userId}-${impactStudySurveyCampaignId}`
}

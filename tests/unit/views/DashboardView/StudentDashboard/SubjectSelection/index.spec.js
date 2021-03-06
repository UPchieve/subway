import appModule from '@/store/modules/app'
import SubjectSelection from '@/views/DashboardView/StudentDashboard/SubjectSelection'
import SubjectCard from '@/views/DashboardView/StudentDashboard/SubjectSelection/SubjectCard'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

const localVue = createLocalVue()
localVue.use(Vuex)

const getWrapper = (mobileMode = false) => {
  const store = new Vuex.Store({
    modules: {
      app: {
        ...appModule,
        getters: {
          mobileMode: () => mobileMode
        }
      },
      user: { state: { latestSession: {} } }
    }
  })

  return shallowMount(SubjectSelection, { localVue, store })
}

describe('SubjectSelection', () => {
  const cards = [
    { title: 'Math Tutoring', topic: 'math' },
    { title: 'Reading and Writing Tutoring', topic: 'readingWriting' },
    { title: 'Science Tutoring', topic: 'science' },
    // { title: 'Social Studies', topic: 'socialStudies' },
    { title: 'College Counseling', topic: 'college' },
    { title: 'Standardized Testing Tutoring', topic: 'sat' },
    {
      title: 'Give Feedback',
      subtitle:
        'Help us improve by telling us what new subjects and features you want!',
      buttonText: 'Give feedback',
      routeTo: '/contact'
    },
    {
      title: 'Invite Your Friends',
      subtitle: 'Share UPchieve with a friend!',
      buttonText: 'Learn More'
    }
  ]

  describe('layout', () => {
    test('mobile', () => {
      const wrapper = getWrapper(true)
      expect(wrapper.classes('SubjectSelection')).toBe(true)

      const header = wrapper.find('h2')
      expect(header.exists()).toBe(true)
      expect(header.text()).toBe('Explore our subjects')

      const subjectCards = wrapper.findAll(SubjectCard)
      expect(subjectCards.length).toBe(cards.length)

      cards.forEach((card, i) => {
        for (let key in card)
          expect(subjectCards.at(i).props()[key]).toBe(card[key])
      })
    })

    test('desktop', () => {
      const wrapper = getWrapper(false)
      expect(wrapper.classes('SubjectSelection')).toBe(true)

      const p = wrapper.find('p')
      expect(p.exists()).toBe(false)

      const subjectCards = wrapper.findAll(SubjectCard)
      expect(subjectCards.length).toBe(cards.length)

      cards.forEach((card, i) => {
        for (let key in card)
          expect(subjectCards.at(i).props()[key]).toBe(card[key])
      })
    })
  })
})

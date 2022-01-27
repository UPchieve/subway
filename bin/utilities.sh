#!/usr/bin/env bash

RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
GRAY="\033[1;30m"
RESET="\033[0m"

step() {
    printf "\n>${YELLOW} %s...${RESET}\n" "${1}"
}

hrule() {
  cols=80

  if [ -z "${cols}" ]; then
    cols="$COLUMNS"
  fi

  printf "${GRAY}"
  for _ in $(seq 1 "$cols"); do
    printf "\u2500"
  done
  printf "${RESET}\n"
}

success() {
    output="$1"
    message="${2:-Done}"

    printf "${GREEN}"

    if [ -n "${VERBOSE}" ] && [ -n "${output}" ]; then
        printf "\n\u2714 %s. Output:\n\n" "${message}"
    else
        printf "\n\u2714 %s\n" "${message}"
    fi

    printf "${RESET}"

    if [ -n "${VERBOSE}" ] && [ -n "${output}" ]; then
        printf "%s\n" "${output}"
    fi
}

error() {
    output="$1"
    message="${2:-Failed}"

    printf "${RED}"

    if [ -n "${output}" ]; then
        printf "\n\u2716 %s. Output:\n\n" "$message"
    else
        printf "\n\u2716 %s\n" "${message}"
    fi

    printf "${RESET}"

    if  [ -n "${output}" ]; then
        printf "%s\n" "${output}"
    fi
}

execute() {
    command="$*"
    printf "\n%s\n" "$command"
    buffer="$(mktemp)"

    if eval "$command" > "$buffer" 2>&1; then
        output="$(cat "$buffer")"
        success "$output"
    else
        output="$(cat "$buffer")"
        error "$output"
    fi

    rm "$buffer"
}

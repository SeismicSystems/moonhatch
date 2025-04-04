export type Filters = {
  hasWebsite: boolean
  hasTelegram: boolean
  hasTwitter: boolean
  hasAllSocials: boolean
  oldestFirst: boolean
  // if null, show all coins
  graduated: boolean | null
}

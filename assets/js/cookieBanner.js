/* eslint-disable */
const setupCookieBanner = () => {
  function confirmCookiesChoice(acceptAnalytics) {
    document.getElementById('cookie-banner-main').hidden = true

    const confirmationMessage =
      acceptAnalytics === 'yes'
        ? document.getElementById('cookie-banner-accepted')
        : document.getElementById('cookie-banner-rejected')

    confirmationMessage.hidden = false
    confirmationMessage.tabIndex = -1
    confirmationMessage.role = 'alert'
    confirmationMessage.focus()

    const cookiePageRadio = document.querySelector(`input[name=acceptAnalytics][value=${acceptAnalytics}]`)
    if (cookiePageRadio) {
      cookiePageRadio.checked = true
    }

    setAnalyticsPreferenceCookie(acceptAnalytics)
  }

  function hideCookiesConfirmation(banner) {
    banner
      .querySelectorAll('#cookie-banner-accepted, #cookie-banner-rejected')
      .forEach(message => (message.hidden = true))

    banner.hidden = true
  }

  function removeAnalyticsCookies() {
    const domain = location.hostname
    const expires = new Date(0).toUTCString()
    const ga4Id = document.querySelector('[data-ga4-id]').getAttribute('data-ga4-id').replace('G-', '')
    document.cookie = `_ga=; domain=${domain}; expires=${expires}; path=/;`
    document.cookie = `_ga_${ga4Id}=; domain=${domain}; expires=${expires}; path=/;`
  }

  function setAnalyticsPreferenceCookie(acceptAnalytics) {
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    document.cookie = `cookie_policy=${encodeURIComponent(JSON.stringify({ acceptAnalytics }))}; expires=${expires.toUTCString()}; path=/; Secure`

    if (acceptAnalytics === 'no') {
      removeAnalyticsCookies()
    }
  }

  const cookieBanner = document.getElementById('cookie-banner')
  if (cookieBanner) {
    cookieBanner.hidden = false

    cookieBanner.querySelectorAll('#cookie-banner-main button').forEach(button => {
      button.addEventListener('click', () => confirmCookiesChoice(button.value))
    })

    cookieBanner.querySelectorAll('#cookie-banner-accepted button, #cookie-banner-rejected button').forEach(button => {
      button.addEventListener('click', () => hideCookiesConfirmation(cookieBanner))
    })
  }
}

export default setupCookieBanner

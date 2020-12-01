const formElement = document.querySelector('form')

/**
 * check valid
 * @param {HTMLElement} inputElement
 */
const checkValidity = ({ validity, name: inputName }) => {
  const errorMessageElement = document.querySelector(
    `[data-name="${inputName}"]`
  )
  errorMessageElement.textContent = validity.valid ? 'valid' : 'not valid'
}

formElement.addEventListener('input', ({ target: inputElement }) => {
  if (!inputElement.matches('input, select, textarea')) return

  checkValidity(inputElement)
  console.log(inputElement)
})

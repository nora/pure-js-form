class Validator {
  constructor() {}

  get isValid() {
    throw new Error('not implemented')
  }

  get errorMessageElement() {
    return document.querySelector(`[data-attr-name="${this.name}"]`)
  }

  /**
   * @param {String} text
   */
  set errorMessageText(text) {
    this.errorMessageElement.textContent = text
  }
}

class InputValidator extends Validator {
  /**
   * @param {HTMLInputElement} element
   */
  constructor(element) {
    super()
    this.name = element.name
    this.inputElement = element
    this.validity = element.validity
  }

  validate() {
    this.errorMessageText = this.isValid ? '' : this.validationMessage
    this.addChangedClass()
  }

  addChangedClass() {
    return this.inputElement.classList.add('changed')
  }

  get isValid() {
    return this.validity.valid
  }

  get validationMessage() {
    return this.inputElement.validationMessage
  }
}

class FormValidator extends Validator {
  /**
   * @param {HTMLFormElement} formContainer
   * @param {Promise<Boolean>} remoteValidator
   */
  constructor(formContainer, remoteValidator) {
    super()
    this.name = formContainer.getAttribute('name')
    this.formContainer = formContainer
    this.remoteValidator = remoteValidator

    formContainer.addEventListener('change', this.handleChangeInput)
    formContainer.addEventListener('submit', event => {
      event.preventDefault()
      this.validateAll()
    })
  }

  get isValid() {
    return this.formContainer.checkValidity()
  }

  handleChangeInput({ target: changedInputElement }) {
    const validator = new InputValidator(changedInputElement)
    validator.validate()
  }

  validateAll() {
    if (!this.isValid) return

    const remoteValidateResult = remoteValidator.validate()
    if (remoteValidateResult === true) {
      return formContainer.submit()
    }
    this.setErrorMessage(remoteValidateResult)
  }

  setErrorMessage({ attrName, message }) {
    document.querySelector(
      `[data-attr-name="${attrName}"]`
    ).textContent = message
  }
}

// class NameConflictError extends Error {
//   constructor(message) {
//     super(message)
//     this.name = 'NameConflictError'
//   }
// }

const formContainer = document.querySelector('form')
const remoteValidator = {
  validate() {
    return {
      attrName: 'name',
      message: '既に使用されている名前です',
    }
  },
}

new FormValidator(formContainer, remoteValidator)

import { Validator } from './Validator'

export class InputValidator extends Validator {
  /**
   * @param {HTMLInputElement} element
   */
  constructor(element, formContainer = null) {
    super()
    this.name = element.name
    this.inputElement = element
    this.formContainer = formContainer
    this.validity = element.validity
  }

  static get ERROR_MESSAGE_ATTRIBUTE_NAME() {
    return 'data-attr-name'
  }

  static get CHANGED_CLASS_NAME() {
    return 'changed'
  }

  validate() {
    this.errorMessage = this.validationMessage
    this.addChangedClass()
    return this.isValid
  }

  addChangedClass() {
    return this.inputElement.classList.add(InputValidator.CHANGED_CLASS_NAME)
  }

  get isValid() {
    return this.validity.valid
  }

  get parent() {
    return this.formContainer ?? window.document
  }

  get errorMessageElement() {
    return this.parent.querySelector(this.errorMessageElementSelector)
  }

  get errorMessageElementSelector() {
    return `[${InputValidator.ERROR_MESSAGE_ATTRIBUTE_NAME}="${this.name}"]`
  }

  /**
   * @param {String} text
   */
  set errorMessage(text) {
    this.errorMessageElement.textContent = text
  }

  get validationMessage() {
    return this.inputElement.validationMessage
  }
}

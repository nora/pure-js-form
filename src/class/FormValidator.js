import { Validator } from './Validator'
import { InputValidator } from './InputValidator'

export class FormValidator extends Validator {
  /**
   * @param {HTMLFormElement} formContainer
   * @param {Function<Promise>} remoteValidator
   */
  constructor(formContainer, remoteValidator) {
    super()
    this.formContainer = formContainer
    this.remoteValidator = remoteValidator
    this._errors = []

    this.inputValidators = this.createInputValidatorList([
      ...formContainer.elements,
    ])
    formContainer.addEventListener('change', event => {
      this.handleChangeFormControll(event)
    })
    formContainer.addEventListener('submit', event => {
      this.handleSubmit(event)
    })
  }

  get isValid() {
    return this.formContainer.reportValidity()
  }

  /**
   * @param {Array<HTMLInputElement>} elements
   */
  createInputValidatorList(elements) {
    return elements.map(element => new InputValidator(element))
  }

  /**
   * @param {Event}
   */
  handleChangeFormControll({ target: { name } }) {
    this.findValidatorByName(name).validate()
  }

  /**
   * @param {Event}
   */
  async handleSubmit(event) {
    event.preventDefault()
    ;(await this.validate()) && this.formContainer.submit()
  }

  /**
   * @param {String} lookingName
   */
  findValidatorByName(lookingName) {
    return this.inputValidators.find(({ name }) => name === lookingName)
  }

  async validate() {
    if (!this.isValid) return false

    if (this.remoteValidate) {
      this.errors = await this.remoteValidate()
    }

    return !this.errors.length
  }

  async remoteValidate() {
    return this.remoteValidator ? this.remoteValidator() : []
  }

  set errors(errors) {
    errors.forEach(error => {
      this.errorMessage = error
    })
    this._errors = errors
  }

  get errors() {
    return this._errors
  }

  set errorMessage({ attributeName, message }) {
    const inputValidator = this.findValidatorByName(attributeName)
    inputValidator.errorMessage = message
    return message
  }
}

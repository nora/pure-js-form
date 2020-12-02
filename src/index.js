import { FormValidator } from './class/FormValidator'

const formContainer = document.querySelector('form')
const mockRemoteValidator = async () => {
  /**
   * モック >> 実際はAPIで検証する処理を書く
   */
  return [
    { attributeName: 'name', message: '既に使用されている名前です' },
    { attributeName: 'email', message: '無効なメールアドレスです' },
    { attributeName: 'flavor', message: '嘘をついてはいけません' },
  ]
}

new FormValidator(formContainer, mockRemoteValidator)

# バニラJSで今っぽくバリデーションを実装する

新卒２年目のヒラノです。

普段JSでの開発というと、おそらく多くの人が`Vue`, `React`, `TS`などを用いていると思います。
ことバリデーションに関しては、ライブラリを用いる場合がほとんどです。

とはいっても`FormValidation`系のAPIって結構充実してるし、バニラでも簡単にいけるのでは・・？」と思ったので、実際にやってみました。

要所で普段あまり目にすることのない、バリデーション系のプロパティについて説明していきます。

## デモ

あとで上げます。

## なにをやっているのか

`HTML5 Validation`のエラーメッセージをそのままインラインバリデーションメッセージとして表示させています。
また、バックエンド検証の結果も表示できます。

## 実装

### HTML

HTML側で準備することは以下です。

- フォームコントロールに`name`を設定
- フォームコントロールにバリデーションする制約(`required`)などを設定
- エラーメッセージを表示する要素の`data-attr-name`属性に対応するフォームの`name`を設定

data属性の設定以外は、HTML5でバリデーションする場合と同じです。

### JS

以下がメイン処理になります。

```js
import { FormValidator } from './class/FormValidator'

const formContainer = document.querySelector('form')
const formValidator = new FormValidator(formContainer)
```

メインは`FormValidator`になります。
`FormValidator`の引数として渡された`formContainer: HTMLFormElement`の所有する`elements`にバリデータを付与します。

`submit`や`change`のイベントにバリデーションがハンドルされています。
`formValidator.validate()`として、明示的に実行することもできます。

#### FormValidatorクラス

まずはコードです。
雑なJSDocはアノテーション目的なのでご容赦ください。

```js
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
```

特筆するフォームバリデーション要素は２つ、

１つは`HTMLFormElement.reportValidity`です。
これはフォームエレメント内のすべてのフォームコントロールがHTMLバリデーション制約をクリアしているかを`Boolean`で返します。
今回は使いませんでしたが、`checkValidity`とすると、プラスで標準のtooltipが表示されます。

もう一つは`remoteValidator`です。
第二引数として渡される独自の関数です。
API等を使ったバックエンドでの検証をする関数を渡すためのインターフェースとして用意しています。
渡されている場合は、Submit時に`HTML5 Validation`が通過したのちに実行されます。
ここで返されるエラーの配列もエラーメッセージとして表示されます。

`remoteValidator`を使う場合は以下のようになります

```js
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
```

次に継承元クラスについて説明します。

#### Validatorクラス

継承している`Validator`は`abstruct`クラスです。
この規模だとあまり恩恵がないですね。

```js
export class Validator {
  get isValid() {
    throw new Error('not implemented')
  }
}
```

最後に`FormValidator`で使われていた`InputValidator`クラスについて解説します。

#### InputValidatorクラス

このクラスは各フォームコントロールに適用されます。
まずはコード全体です。

```js
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
    return this.inputElement.classList.add(this.CHANGED_CLASS_NAME)
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
    return `[${this.ERROR_MESSAGE_ATTRIBUTE_NAME}="${this.name}"]`
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
```

ここでのフォームバリデーションにおける特別な要素は一つ、`HTMLInputElement.validity`です。

これには`HTML5 Validation`でのバリデーション結果が含まれています。
詳細は割愛しますが、アクセスできるプロパティのうち`valid`のみを利用しています。
`valid`は名前通り、検証の可否が`Boolean`で保存されています。

##### 単体で使う場合

`FormValidator`から利用される他、単体で利用することも可能です。

```js
const inputValidator = new InputValidator(element)

// バリデーションし、結果に応じたエラーメッセージを紐づいたメッセージ表示要素に表示します。
inputValidator.validate()

// このようにエラーメッセージを設定できます
// FormValidatorでのバックエンド検証のエラーはこれで反映されています
inputValidator.errorMessage = 'エラーメッセージです'
```

## まとめ

普通にライブラリ使った方が実装は楽そうです。
が、ほとんど標準のAPIだけで十分実用レベルのものが作れました。

フレームワーク、ライブラリなどを利用しない環境では、選択肢としても良いのかもしれませんね。

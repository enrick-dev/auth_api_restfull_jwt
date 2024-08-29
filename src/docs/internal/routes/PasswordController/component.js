const passwordControllerComponent = {
  EmailSendReset: {
    properties: {
      email: {
        type: "string"
      },
    }
  },
  ResetPassword: {
    properties: {
      newpassword: {
        type: "string"
      },
    }
  }
}

export default passwordControllerComponent;
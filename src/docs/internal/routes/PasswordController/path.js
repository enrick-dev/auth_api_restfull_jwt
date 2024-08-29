const passwordControllerPath = {
  "/reset-password/email-send": {
    post: {
      sumary: "Envio de email para redefinição de senha ",
      description: "Essa rota será responsavel por enviar um email com um token para redefinição de senha do usuario",
      tags: ["Redefinição de senha"],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/EmailSendReset"
            },
            examples: {
              EmailSendReset: {
                value: {
                  email: "suporte@makevendas.com.br",
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Email enviado com sucesso",
          "application/json": {
            schema: {
              type: "object",
              $ref: "#/components/schemas/EmailSendReset"
            }
          }
        },
        404: {
          description: "Não existe este e-mail"
        },
        500: {
          description: "erros internos",
          content: {
            "application/json": {
              examples: {
                errorRequest: {
                  summary: "erro interno ao processar requisição",
                  value: { error: "dados de estilo inválidos" }
                },
                errorToken: {
                  summary: "erro interno de token",
                  value: { error: "Token intern error" }
                },
                errorEmail: {
                  summary: "erro interno ao enviar o e-mail",
                  value: { error: "erro interno ao enviar o e-mail" }
                },
              }
            }
          }
        }
      }
    }
  },
  "/reset-password": {
    put: {
      sumary: "Redefinição de senha",
      description: "Essa rota será responsavel fazer a redefinição se senha utilizando o token enviado por email",
      tags: ["Redefinição de senha"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ResetPassword"
            },
          }
        }
      },
      responses: {
        200: {
          description: "Senha alterada com sucesso",
        },
        400: {
          description: "Token de senha invalido",
          content: {
            "application/json": {
              examples: {
                invalidTokenPassword: {
                  value: { error: "Token password invalid" }
                }
              }
            }
          }
        },
        404: {
          description: "Token de senha não fornecido",
          content: {
            "application/json": {
              examples: {
                invalidTokeNotProvided: {
                  value: { error: "Token password not provided" }
                }
              }
            }
          }
        },
        409: {
          description: "Sua senha já foi alterada"
        },
        500: {
          description: "erros internos",
          content: {
            "application/json": {
              examples: {
                errorRequest: {
                  summary: "erro interno ao processar requisição",
                  value: { error: "dados de estilo inválidos" }
                },
                errorToken: {
                  summary: "erro interno de token",
                  value: { error: "Token intern error" }
                }
              }
            }
          }
        }
      }
    }
  }
}


export default passwordControllerPath;
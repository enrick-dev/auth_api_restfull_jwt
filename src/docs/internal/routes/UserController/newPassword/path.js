const newPasswordPath = {
  "/update-password": {
    put: {
      sumary: "Atualizar senha do usuario autenticado",
      description: "Essa rota será responsavel atualizar senha do usuario autenticado",
      tags: ["Usuario Autenticado"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/NewPassword"
            },
            examples: {
              NewPassword: {
                value: {
                  email: "suporte@makevendas.com.br",
                  newPassword: "teste12321"
                }
              }
            }
          }
        }
      },
      responses: {
        500: {
          description: "erro interno ao processar requisição"
        },
        402: {
          description: "dados do usuarios incorretos"
        },
        401: {
          description: "insira uma senha"
        },
        401: {
          description: "mínimo 5 caracteres"
        },
        200: {
          description: "alterado com sucesso",
          "application/json": {
            schema: {
              type: "object",
              $ref: "#/components/schemas/NewPassword"
            }
          }
        }
      }
    }
  }
}

export default newPasswordPath;
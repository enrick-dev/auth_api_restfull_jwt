const authPath = {
  "/auth": {
    post: {
      sumary: "Autenticação de usuario",
      description: "Essa rota será responsavel por autenticacar o usuario e retornar um token",
      tags: ["Autenticação"],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/AuthRequest"
            },
            examples: {
              auth: {
                value: {
                  user: "nomedousuario",
                  password: "teste123",
                  subdomain: "make"
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
        400: {
          description: "senha incorreta"
        },
        403: {
          description: "usuario não existe"
        },
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AuthResponse"
              }
            }
          }
        }
      }
    }
  }
}

export default authPath;
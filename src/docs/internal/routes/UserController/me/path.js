const mePath = {
  "/me": {
    "post": {
      "sumary": "Envio de dados completos do usuário",
      "description": "Essa rota será responsavel por pegar os dados do usuario logo após ele autenticar",
      "tags": ["Usuario Autenticado"],
      "security": [{ "bearerAuth": [] }],
      "requestBody": {
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/MeRequest"
            },
            "examples": {
              "Me": {
                "value": {
                  "username": "nomedousuario",
                  "id_client": 0
                }
              }
            }
          }
        }
      },
      "responses": {
        "500": {
          "description": "erro interno ao processar requisição"
        },
        "200": {
          "description": "OK",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "$ref": "#/components/schemas/MeResponse"
              }
            }
          }
        }
      }
    }
  }
}

export default mePath;
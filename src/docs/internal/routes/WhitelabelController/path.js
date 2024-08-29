const whitelabelPath = {
  "/whitelabel": {
    get: {
      summary: "Obter Whitelabel",
      description: "Obter informações do Whitelabel",
      tags: ["Whitelabel"],
      security: [{ "bearerAuth": [] }],
      parameters: [
        {
          name: "subdomain",
          in: "query",
          description: "subdominio do cliente",
          required: true,
          schema: {
            type: "string"
          }
        }
      ],
      responses: {
        200: {
          description: "Sucesso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/WhitelabelResponse"
              }
            }
          }
        },
        400: {
          description: "Token invalido",
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
              }
            }
          }
        }
      }
    }
  },
  "/upload-logoV": {
    post: {
      summary: "Upload de Logo Vertical",
      description: "Upload de um logo vertical para o Whitelabel",
      tags: ["Whitelabel"],
      security: [{ "bearerAuth": [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              $ref: "#/components/schemas/UploadLogoRequest"
            }
          }
        },
      },
      responses: {
        200: {
          description: "Arquivos enviados com sucesso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UploadLogoResponse"
              }
            }
          }
        },
        400: {
          description: "Requisição inválida",
          content: {
            "application/json": {
              examples: {
                noFile: {
                  summary: "Nenhum arquivo enviado",
                  value: { error: "Nenhum arquivo enviado" }
                },
                invalidFile: {
                  summary: "Um ou mais arquivos enviados não são imagens válidas",
                  value: { error: "Um ou mais arquivos enviados não são imagens válidas" }
                },
                largeFile: {
                  summary: "Envie uma imagem com o tamanho máximo de até 25mb",
                  value: { error: "Envie uma imagem com o tamanho máximo de até 25mb" }
                },
                invalidToken: {
                  summary: "Token invalido",
                  value: { error: "Token invalid" }
                },
              }
            }
          }
        },
        404: {
          description: "Token não fornecido",
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
              }
            }
          }
        }
      }
    }
  },
  "/upload-logoH": {
    post: {
      summary: "Upload de Logo Horizontal",
      description: "Upload de um logo horizontal para o Whitelabel",
      tags: ["Whitelabel"],
      security: [{ "bearerAuth": [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              $ref: "#/components/schemas/UploadLogoRequest"
            }
          }
        },
      },
      responses: {
        200: {
          description: "Arquivos enviados com sucesso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UploadLogoResponse"
              }
            }
          }
        },
        400: {
          description: "Requisição inválida",
          content: {
            "application/json": {
              examples: {
                noFile: {
                  summary: "Nenhum arquivo enviado",
                  value: { error: "Nenhum arquivo enviado" }
                },
                invalidFile: {
                  summary: "Um ou mais arquivos enviados não são imagens válidas",
                  value: { error: "Um ou mais arquivos enviados não são imagens válidas" }
                },
                largeFile: {
                  summary: "Envie uma imagem com o tamanho máximo de até 25mb",
                  value: { error: "Envie uma imagem com o tamanho máximo de até 25mb" }
                },
                invalidToken: {
                  summary: "Token invalido",
                  value: { error: "Token invalid" }
                },
              }
            }
          }
        },
        404: {
          description: "Token não fornecido",
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
              }
            }
          }
        }
      }
    }
  },
  "/upload-style": {
    post: {
      summary: "Upload de Estilo",
      description: "Upload de um estilo para o Whitelabel",
      tags: ["Whitelabel"],
      security: [{ "bearerAuth": [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UploadStyleRequest"
            }
          }
        }
      },
      responses: {
        200: {
          description: "cores personalizadas salvas"
        },
        400: {
          description: "Requisição inválida",
          content: {
            "application/json": {
              examples: {
                invalidStyle: {
                  summary: "dados de estilo inválidos",
                  value: { error: "dados de estilo inválidos" }
                },
                invalidToken: {
                  summary: "Token invalido",
                  value: { error: "Token invalid" }
                },
              }
            }
          }
        },
        404: {
          description: "Token não fornecido",
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
              }
            }
          }
        }
      }
    }
  }
};

export default whitelabelPath;

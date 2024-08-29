const whitelabelComponent = {
  WhitelabelResponse: {
    type: "object",
    properties: {
      logoV: {
        type: "string",
        description: "nome e extensões das logos verticais "
      },
      logoH: {
        type: "string",
        description: "nome e extensões das logos horizontais "
      },
      style: {
        type: "object",
        properties: {
          lightness: {
            type: "number",
            description: "Luminosidade"
          },
          saturation: {
            type: "number",
            description: "Saturação"
          },
          primaryColor: {
            type: "string",
            description: "Cor em hexadecimal"
          },
          secondaryColor: {
            type: "string",
            description: "Cor em hexadecimal"
          },
        }
      }
    }
  },
  UploadLogoRequest: {
    type: "object",
    properties: {
      id_client: {
        type: "string",
        description: "ID do cliente"
      },
      subdomain: {
        type: "string",
        description: "Subdomínio do cliente"
      },
      files: {
        type: "array",
        items: {
          type: "string",
          format: "binary",
        },
        description: "Imagens de Logotipo no tema dark e light"
      }
    }
  },
  UploadLogoResponse: {
    type: "object",
    properties: {
      message: {
        type: "string",
        description: "Mensagem de 'Arquivos enviados com sucesso'"
      },
      media: {
        type: "array",
        description: "Url das logotipos",
        items: {
          type: "string",
          format: "url"
        }
      }
    }
  },
  UploadStyleRequest: {
    type: "object",
    properties: {
      id_client: {
        type: "number",
        description: "ID do cliente'"
      },
      style: {
        type: "object",
        properties: {
          primaryColor: {
            type: "string",
            description: "Cor hexadecimal'"
          },
          secondaryColor: {
            type: "string",
            description: "Cor hexadecimal'"
          },
          saturation: {
            type: "number",
            description: "Saturação'"
          },
          lightness: {
            type: "number",
            description: "Luminosidade'"
          }
        }
      }
    }
  }
};

export default whitelabelComponent;

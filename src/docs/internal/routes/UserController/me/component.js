const meComponent = {
  MeRequest: {
    properties: {
      username: {
        type: "string"
      },
      id_client: {
        type: "number"
      },
    }
  },
  MeResponse: {
    properties: {
      me: {
        type: "object",
        properties: {
          id: { type: "number", description: "ID do usuário" },
          name: { type: "string", description: "Nome do usuário" },
          username: { type: "string", description: "Nome de usuário" },
          email: { type: "string", description: "Email do usuário" }
        }
      }
    }
  }
}

export default meComponent;
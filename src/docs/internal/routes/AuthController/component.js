const authComponent = {
  AuthRequest: {
    type: "object",
    properties: {
      email: {
        type: "string",
        description: "Email do usuário"
      },
      password: {
        type: "string",
        description: "Senha do usuário"
      }
    },
    required: ["email", "password"]
  },
  AuthResponse: {
    type: "object",
    properties: {
      user: {
        type: "object",
        properties: {
          id_client: { type: "number", description: "ID do cliente" },
          username: { type: "string", description: "Nome de usuario" }
        }
      },
      token: { type: "string", description: "Token JWT" }

    }
  }
};

export default authComponent;

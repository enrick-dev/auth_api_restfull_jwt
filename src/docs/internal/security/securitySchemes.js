const securitySchemes = {
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    }
  }
}

export default securitySchemes;
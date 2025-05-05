const SCREEN_RESPONSES = {
  CADASTRO_INICIAL: {
    screen: "CADASTRO_INICIAL",
    data: {
      tipo_pessoa: [
        {
          id: "pf",
          title: "Pessoa Física",
        },
        {
          id: "pj",
          title: "Pessoa Jurídica",
        }
      ],
      categoria: [
        {
          id: "individual",
          title: "Cooperado Individual"
        },
        {
          id: "empresarial",
          title: "Cooperado Empresarial"
        }
      ],
      is_categoria_enabled: false
    }
  },
  DADOS_PESSOAIS: {
    screen: "DADOS_PESSOAIS",
    data: {
      tipo_pessoa: "",
      categoria: "",
    }
  },
  DOCUMENTOS: {
    screen: "DOCUMENTOS",
    data: {
      nome: "",
      email: "",
      telefone: "",
      cpf_cnpj: "",
      data_nascimento: "",
    }
  },
  ENDERECO: {
    screen: "ENDERECO",
    data: {
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
    }
  },
  CONFIRMACAO: {
    screen: "CONFIRMACAO",
    data: {
      resumo: "",
      dados_completos: "",
    }
  },
  SUCCESS: {
    screen: "SUCCESS",
    data: {
      extension_message_response: {
        params: {
          flow_token: "REPLACE_FLOW_TOKEN",
        },
      },
    },
  },
};

export const getNextScreen = async (decryptedBody) => {
  const { screen, data, action, flow_token } = decryptedBody;

  if (action === "ping") {
    return {
      data: {
        status: "active",
      },
    };
  }

  if (data?.error) {
    console.warn("Received client error:", data);
    return {
      data: {
        acknowledged: true,
      },
    };
  }

  if (action === "INIT") {
    return {
      ...SCREEN_RESPONSES.CADASTRO_INICIAL,
      data: {
        ...SCREEN_RESPONSES.CADASTRO_INICIAL.data,
        is_categoria_enabled: false,
      },
    };
  }

  if (action === "data_exchange") {
    switch (screen) {
      case "CADASTRO_INICIAL":
        return {
          ...SCREEN_RESPONSES.CADASTRO_INICIAL,
          data: {
            ...SCREEN_RESPONSES.CADASTRO_INICIAL.data,
            is_categoria_enabled: Boolean(data.tipo_pessoa),
          },
        };

      case "DADOS_PESSOAIS":
        const formattedData = `Tipo: ${data.tipo_pessoa === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
Categoria: ${data.categoria === 'individual' ? 'Cooperado Individual' : 'Cooperado Empresarial'}
Nome: ${data.nome}
Email: ${data.email}
Telefone: ${data.telefone}
${data.tipo_pessoa === 'pf' ? 'CPF' : 'CNPJ'}: ${data.cpf_cnpj}`;

        return {
          ...SCREEN_RESPONSES.DOCUMENTOS,
          data: {
            ...data,
            formatted_data: formattedData,
          },
        };

      case "DOCUMENTOS":
        return {
          ...SCREEN_RESPONSES.ENDERECO,
          data: {
            ...data,
          },
        };

      case "ENDERECO":
        const enderecoCompleto = `${data.logradouro}, ${data.numero}
${data.complemento ? data.complemento + ' - ' : ''}${data.bairro}
${data.cidade} - ${data.estado}
CEP: ${data.cep}`;

        return {
          ...SCREEN_RESPONSES.CONFIRMACAO,
          data: {
            resumo: `Confirmação de Cadastro de Cooperado`,
            dados_completos: `${data.formatted_data}\n\nEndereço:\n${enderecoCompleto}`,
            ...data,
          },
        };

      case "CONFIRMACAO":
        // TODO: Implementar salvamento no banco de dados
        return {
          ...SCREEN_RESPONSES.SUCCESS,
          data: {
            extension_message_response: {
              params: {
                flow_token,
                message: "Cadastro realizado com sucesso! Em breve entraremos em contato.",
              },
            },
          },
        };

      default:
        break;
    }
  }

  console.error("Unhandled request body:", decryptedBody);
  throw new Error(
    "Unhandled endpoint request. Make sure you handle the request action & screen logged above."
  );
};
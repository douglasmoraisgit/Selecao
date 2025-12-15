package br.com.vendas.beans;

public class Otica {
    private int idOtica;        // Identificador único da ótica (chave primária)
    private String nomeOtica;   // Nome da ótica
    private String usuarioOtica; // Nome de usuário da ótica
    private String senhaOtica;  // Senha da ótica
    private String emailOtica;  // E-mail da ótica
    private String telefoneOtica;    // Telefone da ótica (opcional)
    private String enderecoOtica;
    private String cidadeOtica;
    private String estadoOtica;
    
    
    // Construtor padrão
    public Otica() {
    }

    // Construtor com parâmetros
    public Otica(int idOtica, String nomeOtica, String usuarioOtica, String senhaOtica, String emailOtica, String telefoneOtica) {
        this.idOtica = idOtica;
        this.nomeOtica = nomeOtica;
        this.usuarioOtica = usuarioOtica;
        this.senhaOtica = senhaOtica;
        this.emailOtica = emailOtica;
        this.telefoneOtica = telefoneOtica;
    }

    // Getters e Setters

    public int getIdOtica() {
        return idOtica;
    }

    public void setIdOtica(int idOtica) {
        this.idOtica = idOtica;
    }

    public String getNomeOtica() {
        return nomeOtica;
    }

    public void setNomeOtica(String nomeOtica) {
        this.nomeOtica = nomeOtica;
    }

    public String getUsuarioOtica() {
        return usuarioOtica;
    }

    public void setUsuarioOtica(String usuarioOtica) {
        this.usuarioOtica = usuarioOtica;
    }

    public String getSenhaOtica() {
        return senhaOtica;
    }

    public void setSenhaOtica(String senhaOtica) {
        this.senhaOtica = senhaOtica;
    }

    public String getEmailOtica() {
        return emailOtica;
    }

    public void setEmailOtica(String emailOtica) {
        this.emailOtica = emailOtica;
    }

    public String getTelefoneOtica() {
        return telefoneOtica;
    }

    public void setTelefoneOtica(String telefoneOtica) {
        this.telefoneOtica = telefoneOtica;
    }
    public String getEnderecoOtica() {
        return enderecoOtica;
    }

    public void setEnderecoOtica(String enderecoOtica) {
        this.enderecoOtica = enderecoOtica;
    }

    public String getCidadeOtica() {
		return cidadeOtica;
	}

	public String getEstadoOtica() {
		return estadoOtica;
	}

	public void setCidadeOtica(String cidadeOtica) {
		this.cidadeOtica = cidadeOtica;
	}

	public void setEstadoOtica(String estadoOtica) {
		this.estadoOtica = estadoOtica;
	}

	// Método toString() para facilitar a exibição dos dados da ótica
    @Override
    public String toString() {
        return "Otica{" +
                "idOtica=" + idOtica +
                ", nomeOtica='" + nomeOtica + '\'' +
                ", usuarioOtica='" + usuarioOtica + '\'' +
                ", senhaOtica='" + senhaOtica + '\'' +
                ", emailOtica='" + emailOtica + '\'' +
                ", telefoneOtica='" + telefoneOtica + '\'' +
                '}';
    }
}

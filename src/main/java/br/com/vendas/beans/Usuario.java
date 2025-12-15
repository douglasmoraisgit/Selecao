package br.com.vendas.beans;

public class Usuario {

	private int id;
	private String nome;
	private String username;
	private String senha;
	private String email;
	private Otica otica;
	private Perfil perfil;
	
	

	public Otica getOtica() {
		return otica;
	}

	public void setOtica(Otica otica) {
		this.otica = otica;
	}

	public Perfil getPerfil() {
		return perfil;
	}

	public void setPerfil(Perfil perfil) {
		this.perfil = perfil;
	}

	// Getters e setters
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getSenha() {
		return senha;
	}

	public void setSenha(String senha) {
		this.senha = senha;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	

	
}

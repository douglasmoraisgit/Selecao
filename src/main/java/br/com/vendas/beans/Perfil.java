package br.com.vendas.beans;

public class Perfil {
    private int id;
    private String nome;  // em vez de cargo, agora fica igual ao banco

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
}

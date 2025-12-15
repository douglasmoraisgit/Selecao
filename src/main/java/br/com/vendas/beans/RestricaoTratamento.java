package br.com.vendas.beans;

/**
 * Representa uma restrição de tratamento para família/marca de lentes.
 * 
 * Exemplo: Varilux só pode ser vendida com Anti-Reflexo
 */
public class RestricaoTratamento {
    
    private int id;
    private String tipoRestricao;  // FAMILIA ou MARCA
    private String codigoItem;     // Nome da família ou marca
    private String tipoTratamento; // Anti-Reflexo, Fotossensivel, etc
    private String mensagem;
    private boolean ativo;
    
    public RestricaoTratamento() {}
    
    // Getters e Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public String getTipoRestricao() { return tipoRestricao; }
    public void setTipoRestricao(String tipoRestricao) { this.tipoRestricao = tipoRestricao; }
    
    public String getCodigoItem() { return codigoItem; }
    public void setCodigoItem(String codigoItem) { this.codigoItem = codigoItem; }
    
    public String getTipoTratamento() { return tipoTratamento; }
    public void setTipoTratamento(String tipoTratamento) { this.tipoTratamento = tipoTratamento; }
    
    public String getMensagem() { return mensagem; }
    public void setMensagem(String mensagem) { this.mensagem = mensagem; }
    
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
    
    @Override
    public String toString() {
        return "RestricaoTratamento{" +
                "tipoRestricao='" + tipoRestricao + '\'' +
                ", codigoItem='" + codigoItem + '\'' +
                ", tipoTratamento='" + tipoTratamento + '\'' +
                '}';
    }
}

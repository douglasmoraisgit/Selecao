package br.com.vendas.beans;

/**
 * Bean que representa uma opção de coloração para lentes.
 * 
 * Tipos disponíveis:
 * - Total (Sólida): cor uniforme em toda a lente
 * - Degradê: cor gradiente (mais escura em cima, mais clara embaixo)
 * 
 * Só aplicável a lentes com permite_colorir = 'Sim' na tabela produtoteste.
 * 
 * @author OptoFreela
 */
public class ColoracaoBean extends Produto {

    private int codigo;              // Usando 'codigo' como no Tratamento.java
    private String tipo;              // "Total" ou "Degradê"
    private String nome;              // "Cinza II", "Verde G15", etc
    private String codigoFornecedor;  // Código para pedido ao fornecedor
    private Double valorCusto;
    private Double valorVenda;
    private String corHex;            // Cor hexadecimal para preview (#9898A8)
    private boolean ativo;

    // ========================================
    // CONSTRUTORES
    // ========================================
    
    public ColoracaoBean() {
        this.ativo = true;
    }
    
    public ColoracaoBean(int codigo, String tipo, String nome, Double valorVenda) {
        this.codigo = codigo;
        this.tipo = tipo;
        this.nome = nome;
        this.valorVenda = valorVenda;
        this.ativo = true;
    }
    
    public ColoracaoBean(int codigo, String tipo, String nome, String codigoFornecedor, 
                         Double valorCusto, Double valorVenda, String corHex) {
        this.codigo = codigo;
        this.tipo = tipo;
        this.nome = nome;
        this.codigoFornecedor = codigoFornecedor;
        this.valorCusto = valorCusto;
        this.valorVenda = valorVenda;
        this.corHex = corHex;
        this.ativo = true;
    }

    // ========================================
    // MÉTODOS DE CONVENIÊNCIA
    // ========================================
    
    /**
     * Verifica se é coloração tipo Total (sólida)
     */
    public boolean isTotal() {
        return "Total".equalsIgnoreCase(this.tipo);
    }
    
    /**
     * Verifica se é coloração tipo Degradê
     */
    public boolean isDegrade() {
        return "Degradê".equalsIgnoreCase(this.tipo) || 
               "Degrade".equalsIgnoreCase(this.tipo);
    }
    
    /**
     * Retorna descrição completa (tipo + nome)
     */
    public String getDescricaoCompleta() {
        return this.tipo + " - " + this.nome;
    }

    // ========================================
    // GETTERS E SETTERS
    // ========================================
    
    public int getCodigo() {
        return codigo;
    }

    public void setCodigo(int codigo) {
        this.codigo = codigo;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCodigoFornecedor() {
        return codigoFornecedor;
    }

    public void setCodigoFornecedor(String codigoFornecedor) {
        this.codigoFornecedor = codigoFornecedor;
    }

    public Double getValorCusto() {
        return valorCusto;
    }

    public void setValorCusto(Double valorCusto) {
        this.valorCusto = valorCusto;
    }

    public Double getValorVenda() {
        return valorVenda;
    }

    public void setValorVenda(Double valorVenda) {
        this.valorVenda = valorVenda;
    }

    public String getCorHex() {
        return corHex;
    }

    public void setCorHex(String corHex) {
        this.corHex = corHex;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    // ========================================
    // MÉTODOS DE PRODUTO (HERANÇA)
    // ========================================
    
    @Override
    public void imprimirDetalhes() {
        System.out.println(this.toString());
    }

    @Override
    public double getIncremento() {
        return this.valorVenda != null ? this.valorVenda : 0.0;
    }

    // ========================================
    // toString
    // ========================================
    
    @Override
    public String toString() {
        return "ColoracaoBean{" +
                "codigo=" + codigo +
                ", tipo='" + tipo + '\'' +
                ", nome='" + nome + '\'' +
                ", codigoFornecedor='" + codigoFornecedor + '\'' +
                ", valorCusto=" + valorCusto +
                ", valorVenda=" + valorVenda +
                ", corHex='" + corHex + '\'' +
                ", ativo=" + ativo +
                '}';
    }
}

package br.com.vendas.beans;



import java.util.ArrayList;
import java.util.List;

/**
 * Classe que representa uma lente com tratamentos
 * Solução 1: Usa um nome diferente para evitar conflitos
 */
public class LenteComTratamento_Antiga extends Lente {
    private long chaveUnica; // Nome diferente para evitar conflito
    private List<Tratamento> tratamentos;
    private String lado; // "OD" para Olho Direito, "OE" para Olho Esquerdo
    private long chave;
    
 /*   public LenteComTratamento() {
        super();
    }
*/    
    public LenteComTratamento_Antiga() {
        super();
        this.tratamentos = new ArrayList<>(); // Inicializa a lista de tratamentos
    }

  /*  public LenteComTratamento(Lente lente) {
        super();
        // Copia os dados da lente para LenteComTratamento
        this.setId(lente.getId());  // Aqui você garante que o id é copiado corretamente
        this.setIdLente(lente.getIdLente());
        this.setMarca(lente.getMarca());
        this.setDescricao(lente.getDescricao());
        this.setTipo(lente.getTipo());
        this.setPrecoVenda(lente.getPrecoVenda());
        this.setUnidade(lente.getUnidade());
        this.setFabricante(lente.getFabricante());
        this.tratamentos = new ArrayList<>(); // Inicializa a lista de tratamentos
    }
    */
    public LenteComTratamento_Antiga(Lente lente) {
        super();
        this.setId(lente.getId());
        this.setIdLente(lente.getIdLente());
        this.setMarca(lente.getMarca());
        this.setDescricao(lente.getDescricao());
        this.setTipo(lente.getTipo());
        this.setPrecoVenda(lente.getPrecoVenda());
        this.setPrecoMinimo(lente.getPrecoMinimo());
        this.setPrecoCusto(lente.getPrecoCusto());
        this.setPrecoPar(lente.getPrecoPar());
        this.setUnidade(lente.getUnidade());
        this.setFabricante(lente.getFabricante());
        this.setCodigoWeb(lente.getCodigoWeb());               // ✅ ESSENCIAL
        this.setCodProdFornecedor(lente.getCodProdFornecedor()); // opcional, mas útil

        this.tratamentos = new ArrayList<>();
    }


    
    public long getChaveUnica() {
        return chaveUnica;
    }
    
    public void setChaveUnica(long chaveUnica) {
        this.chaveUnica = chaveUnica;
    }
    

    public Long getChave() {
  		return chave;
  	}

  	public void setChave(long chave) {
  		this.chave = chave;
  	}
    public List<Tratamento> getTratamentos() {
        return tratamentos;
    }
    
    public void setTratamentos(List<Tratamento> tratamentos) {
        this.tratamentos = tratamentos;
    }
    
    public String getLado() {
        return lado;
    }
    
    public void setLado(String lado) {
        this.lado = lado;
    }
    
  

    
    /**
     * Método conveniente para verificar se é olho direito
     */
    public boolean isOlhoDireito() {
        return "OD".equals(lado);
    }
    
    /**
     * Método conveniente para verificar se é olho esquerdo
     */
    public boolean isOlhoEsquerdo() {
        return "OE".equals(lado);
    }
    
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("LenteComTratamento{");
        sb.append("chaveUnica=").append(chaveUnica);
        sb.append(", lado='").append(lado).append('\'');
        sb.append(", idLente=").append(getIdLente());
        sb.append(", marca='").append(getMarca()).append('\'');
        sb.append(", descricao='").append(getDescricao()).append('\'');
        sb.append(", tratamentos=").append(tratamentos);
        sb.append('}');
        return sb.toString();
    }
}
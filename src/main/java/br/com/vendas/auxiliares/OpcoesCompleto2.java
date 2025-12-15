package br.com.vendas.auxiliares;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Classe auxiliar para montar filtros de busca de lentes.
 * 
 * MODIFICAÇÃO: Agora extrai o filtro de antireflexo separadamente
 * para permitir fallback quando lente não vem com AR de fábrica.
 * 
 * @author OptoFreela
 */
public class OpcoesCompleto2 {
    
    private String tipoVisao;
    private String filtroAntireflexo; // NOVO: armazena o antireflexo selecionado
    private String filtroColoracao;   // NOVO: armazena a coloração selecionada
    private String filtroColoracaoTipo; // NOVO: armazena o tipo (Total ou Degradê)

    public String filtro(HttpServletRequest request) {
        System.out.println("Classe OpcoesCompleto");

        StringBuilder sql = new StringBuilder();
        Map<String, String[]> parametros = request.getParameterMap();
        
        // Reset do filtro de antireflexo
        this.filtroAntireflexo = null;
        this.filtroColoracao = null;  // NOVO: reset coloração
        this.filtroColoracaoTipo = null; // NOVO: reset tipo coloração

        processarParametro(parametros, "visao", sql, true);
        processarParametro(parametros, "producao", sql, false);
        processarParametro(parametros, "fabricante", sql, false);
        processarParametro(parametros, "material", sql, false);
        
        // MODIFICADO: Processa antireflexo e armazena o valor
        processarParametroAntireflexo(parametros, sql);
        
        processarParametro(parametros, "tratamento", sql, false);
        processarParametro(parametros, "fotossensivel", sql, false);
        processarParametro(parametros, "indice", sql, false);
        processarParametro(parametros, "afinamento", sql, false);
        processarParametro(parametros, "ar_residual", sql, false);
        processarParametro(parametros, "antiblue", sql, false);
        processarParametro(parametros, "marca", sql, false);
        processarParametro(parametros, "cor_foto", sql, false);
        processarParametro(parametros, "familia", sql, false);
        
        // NOVO: Processa coloração (captura valor e adiciona filtro permite_colorir)
        processarParametroColoracao(parametros, sql);

        // Remover último " AND " para evitar erro de SQL mal formado
        if (sql.length() > 5) {
            sql.setLength(sql.length() - 5);
        }

        return sql.toString();
    }
    
    /**
     * Versão do filtro que NÃO inclui antireflexo (para fallback)
     */
    public String filtroSemAntireflexo(HttpServletRequest request) {
        System.out.println("Classe OpcoesCompleto - filtroSemAntireflexo");

        StringBuilder sql = new StringBuilder();
        Map<String, String[]> parametros = request.getParameterMap();
        
        // Armazena o filtro de antireflexo mas não adiciona ao SQL
        extrairFiltroAntireflexo(parametros);

        processarParametro(parametros, "visao", sql, true);
        processarParametro(parametros, "producao", sql, false);
        processarParametro(parametros, "fabricante", sql, false);
        processarParametro(parametros, "material", sql, false);
        // OMITE antireflexo propositalmente
        processarParametro(parametros, "tratamento", sql, false);
        processarParametro(parametros, "fotossensivel", sql, false);
        processarParametro(parametros, "indice", sql, false);
        processarParametro(parametros, "afinamento", sql, false);
        processarParametro(parametros, "ar_residual", sql, false);
        processarParametro(parametros, "antiblue", sql, false);
        processarParametro(parametros, "marca", sql, false);
        processarParametro(parametros, "cor_foto", sql, false);
        processarParametro(parametros, "familia", sql, false);

        if (sql.length() > 5) {
            sql.setLength(sql.length() - 5);
        }

        return sql.toString();
    }

    private void processarParametro(Map<String, String[]> parametros, String prefixo, StringBuilder sql, boolean isVisao) {
        StringBuilder temp = new StringBuilder();

        for (Map.Entry<String, String[]> entry : parametros.entrySet()) {
            String key = entry.getKey();
            String[] values = entry.getValue();

            if (key.startsWith(prefixo) && values.length > 0) {
                for (String valor : values) {
                    String valorFormatado = isVisao ? normalizarVisao(valor) : valor;
                    temp.append(key).append(" = '").append(valorFormatado).append("' OR ");
                }
            }
        }

        if (temp.length() > 4) {
            temp.setLength(temp.length() - 4); // Remove o último " OR "
            sql.append("(").append(temp).append(") AND ");
        }

        if (isVisao) {
            System.err.println("Final tipoVisao após processarParametro: " + tipoVisao);
        }
    }
    
    /**
     * NOVO: Processa antireflexo e armazena o valor para uso no fallback
     */
    private void processarParametroAntireflexo(Map<String, String[]> parametros, StringBuilder sql) {
        StringBuilder temp = new StringBuilder();
        
        for (Map.Entry<String, String[]> entry : parametros.entrySet()) {
            String key = entry.getKey();
            String[] values = entry.getValue();

            if (key.startsWith("antireflexo") && values.length > 0) {
                // Armazena o primeiro valor de antireflexo para fallback
                if (this.filtroAntireflexo == null && values[0] != null && !values[0].isEmpty()) {
                    this.filtroAntireflexo = values[0];
                    System.out.println("🔍 Filtro antireflexo detectado: " + this.filtroAntireflexo);
                }
                
                for (String valor : values) {
                    temp.append(key).append(" = '").append(valor).append("' OR ");
                }
            }
        }

        if (temp.length() > 4) {
            temp.setLength(temp.length() - 4);
            sql.append("(").append(temp).append(") AND ");
        }
    }
    
    /**
     * NOVO: Extrai o filtro de antireflexo sem adicionar ao SQL
     */
    private void extrairFiltroAntireflexo(Map<String, String[]> parametros) {
        for (Map.Entry<String, String[]> entry : parametros.entrySet()) {
            String key = entry.getKey();
            String[] values = entry.getValue();

            if (key.startsWith("antireflexo") && values.length > 0) {
                if (values[0] != null && !values[0].isEmpty()) {
                    this.filtroAntireflexo = values[0];
                    System.out.println("🔍 Filtro antireflexo extraído: " + this.filtroAntireflexo);
                    return;
                }
            }
        }
    }
    
    /**
     * NOVO: Processa coloração - captura valor, tipo e adiciona filtro permite_colorir
     */
    private void processarParametroColoracao(Map<String, String[]> parametros, StringBuilder sql) {
        String corNome = null;
        String corTipo = null;
        
        for (Map.Entry<String, String[]> entry : parametros.entrySet()) {
            String key = entry.getKey();
            String[] values = entry.getValue();

            if (key.equals("coloracao") && values.length > 0) {
                corNome = values[0];
            }
            if (key.equals("coloracaoTipo") && values.length > 0) {
                corTipo = values[0];
            }
        }
        
        // Se tem coloração selecionada (diferente de "Sem Coloração")
        if (corNome != null && !corNome.isEmpty() && !corNome.equalsIgnoreCase("Sem Coloração")) {
            this.filtroColoracao = corNome;
            this.filtroColoracaoTipo = corTipo;
            System.out.println("🎨 Filtro coloração detectado: " + this.filtroColoracao + " (Tipo: " + this.filtroColoracaoTipo + ")");
            
            // Adiciona filtro para lentes que permitem colorir
            sql.append("(permite_colorir = 'Sim') AND ");
        }
    }
    
    /**
     * NOVO: Retorna o filtro de coloração selecionado
     * @return Nome da coloração ou null se não selecionado
     */
    public String getFiltroColoracao() {
        return this.filtroColoracao;
    }
    
    /**
     * NOVO: Retorna o tipo de coloração selecionado (Total ou Degradê)
     * @return Tipo da coloração ou null se não selecionado
     */
    public String getFiltroColoracaoTipo() {
        return this.filtroColoracaoTipo;
    }

    private String normalizarVisao(String visao) {
        System.err.println("Valor recebido para visao no OpçõesCompleto: " + visao);
        
        if (visao.equalsIgnoreCase("Perto") || visao.equalsIgnoreCase("meia_distancia") || visao.equalsIgnoreCase("Longe")) {
            tipoVisao = "Monofocal";
        } else {
            tipoVisao = visao;
        }

        System.err.println("tipoVisao atualizado para: " + tipoVisao);
        return tipoVisao;
    }
  
    public String getTipoVisao() {
        System.err.println("Chamando getTipoVisao(), valor atual: " + tipoVisao);
        return tipoVisao;
    }
    
    /**
     * NOVO: Retorna o filtro de antireflexo selecionado
     * @return Nome do antireflexo ou null se não selecionado
     */
    public String getFiltroAntireflexo() {
        return this.filtroAntireflexo;
    }

    public String grau(Double esf, Double cil) {
        return new ConverteLimita().convertePorChave(esf, cil);
    }

    public String converteMultifocal(Double esf, Double cil, Double adicao) {
        return new ConverteLimita().converteMultifocal(esf, cil, adicao);
    }
    
    public String converteBifocal(Double esf, Double cil, Double adicao) {
        return new ConverteLimita().converteBifocal(esf, cil, adicao);
    }

    public String transposicao(Double esf, Double cil) {
        return new ConverteLimita().converteGrau(esf, cil);
    }

    public String converteFiltroCompleto(double esf, double cil) {
        String filtroIgualdade = new ConverteLimita().converteGrau(esf, cil); 
        String filtroFaixa = new ConverteLimita().convertePorChave(esf, cil); 
        return " ( " + filtroIgualdade + " OR " + filtroFaixa + " ) ";
    }
}

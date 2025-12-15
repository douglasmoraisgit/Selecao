package br.com.vendas.servlet;

import java.io.IOException;
import java.sql.SQLException;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.google.gson.Gson;

import br.com.vendas.auxiliares.OpcoesCompleto;
import br.com.vendas.auxiliares.Variante;
import br.com.vendas.beans.LenteComTratamento;
import br.com.vendas.beans.LenteODeOE;
import br.com.vendas.dao.LentesDao;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Servlet para seleção de lentes com fallback para tratamentos.
 * 
 * NOVA FUNCIONALIDADE:
 * Quando o usuário seleciona um antireflexo e não existem lentes
 * que vêm de fábrica com esse AR, o sistema busca lentes BASE
 * que são compatíveis com o tratamento via tabela familia_tratamento.
 * 
 * @author OptoFreela
 */
public class SelecaoLentes extends HttpServlet {

    private static final long serialVersionUID = 2107036021593819135L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setCharacterEncoding("UTF-8");

        // Captura segura dos parâmetros
        double odesf = parseDoubleSeguro(request.getParameter("rod_esf"));
        double odcil = parseDoubleSeguro(request.getParameter("rod_cil"));
        int odeixo = parseIntSeguro(request.getParameter("rod_eixo"));
        double odadicao = parseDoubleSeguro(request.getParameter("rod_adicao"));
        double oeesf = parseDoubleSeguro(request.getParameter("roe_esf"));
        double oecil = parseDoubleSeguro(request.getParameter("roe_cil"));
        int oeeixo = parseIntSeguro(request.getParameter("roe_eixo"));
        double oeadicao = parseDoubleSeguro(request.getParameter("roe_adicao"));

        String visao = request.getParameter("visao");
        System.out.println("VISAO: " + visao);

        String olhodireito, olhoesquerdo;

        LentesDao dao = new LentesDao();
        OpcoesCompleto filtro = new OpcoesCompleto();
        String opcoes = filtro.filtro(request);
        String tipoVisao = filtro.getTipoVisao();
        
        // NOVO: Captura o filtro de antireflexo para fallback
        String filtroAntireflexo = filtro.getFiltroAntireflexo();
        System.out.println("🔍 Filtro AR para fallback: " + filtroAntireflexo);
        
        // NOVO: Captura o filtro de coloração e tipo
        String filtroColoracao = filtro.getFiltroColoracao();
        String filtroColoracaoTipo = filtro.getFiltroColoracaoTipo();
        System.out.println("🎨 Filtro Coloração: " + filtroColoracao + " (Tipo: " + filtroColoracaoTipo + ")");

        if ("multifocal".equals(tipoVisao)) {
            olhodireito = filtro.converteMultifocal(odesf, odcil, odadicao);
            olhoesquerdo = filtro.converteMultifocal(oeesf, oecil, oeadicao);
        } else if ("bifocal".equals(tipoVisao)) {
            olhodireito = filtro.converteBifocal(odesf, odcil, odadicao);
            olhoesquerdo = filtro.converteBifocal(oeesf, oecil, oeadicao);
        } else if ("ocupacional".equals(tipoVisao)) {
            olhodireito = filtro.converteMultifocal(odesf, odcil, odadicao);
            olhoesquerdo = filtro.converteMultifocal(oeesf, oecil, oeadicao);
        } else if ("longe".equalsIgnoreCase(visao)) {
            olhodireito = filtro.converteFiltroCompleto(odesf, odcil);
            olhoesquerdo = filtro.converteFiltroCompleto(oeesf, oecil);
        } else if ("perto".equalsIgnoreCase(visao)) {
            olhodireito = filtro.converteFiltroCompleto(odesf + odadicao, odcil);
            olhoesquerdo = filtro.converteFiltroCompleto(oeesf + oeadicao, oecil);
        } else if ("meia_distancia".equalsIgnoreCase(visao)) {
            olhodireito = filtro.transposicao(calcularMeiaDistancia(odesf, odadicao), odcil);
            olhoesquerdo = filtro.transposicao(calcularMeiaDistancia(oeesf, oeadicao), oecil);
        } else {
            olhodireito = filtro.transposicao(odesf, odcil);
            olhoesquerdo = filtro.transposicao(oeesf, oecil);
        }

        if (!opcoes.isEmpty()) {
            olhodireito += " AND " + opcoes;
            olhoesquerdo += " AND " + opcoes;
        }

        // MODIFICADO: Usa o novo método com fallback, coloração e tipo
        List<LenteComTratamento> odLentes = buscarLentesComFallback(dao, olhodireito, "od", filtroAntireflexo, filtroColoracao, filtroColoracaoTipo);
        List<LenteComTratamento> oeLentes = buscarLentesComFallback(dao, olhoesquerdo, "oe", filtroAntireflexo, filtroColoracao, filtroColoracaoTipo);

        System.out.println("OD Lentes: " + odLentes.size());
        System.out.println("OE Lentes: " + oeLentes.size());

        // MODIFICADO: Usa o novo método de agrupamento
        Map<String, Map<String, Variante>> lentesAgrupadas = 
            agruparLentesComTratamento(odLentes, oeLentes, odesf, odcil, odeixo, odadicao, oeesf, oecil, oeeixo, oeadicao, visao);

        System.out.println("Lentes Agrupadas: " + new Gson().toJson(lentesAgrupadas));

        response.setContentType("application/json;charset=UTF-8");
        new Gson().toJson(lentesAgrupadas, response.getWriter());
    }

    /**
     * NOVO: Busca lentes com fallback para tratamentos compatíveis e coloração
     */
    private List<LenteComTratamento> buscarLentesComFallback(
            LentesDao dao, 
            String grau, 
            String olho, 
            String filtroAntireflexo,
            String filtroColoracao,
            String filtroColoracaoTipo) {
        try {
            return dao.getLentesComFallback(grau, olho, filtroAntireflexo, filtroColoracao, filtroColoracaoTipo);
        } catch (SQLException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**
     * MODIFICADO: Agrupa lentes incluindo dados de tratamento adicional
     */
    private Map<String, Map<String, Variante>> agruparLentesComTratamento(
            List<LenteComTratamento> od, List<LenteComTratamento> oe,
            double odesf, double odcil, int odeixo, double odadicao,
            double oeesf, double oecil, int oeeixo, double oeadicao,
            String visao) {

        Map<String, Map<String, Variante>> agrupado = new LinkedHashMap<>();

        // Processar lentes OD
        for (LenteComTratamento lente : od) {
            String marca = lente.getMarca();
            String variante = lente.getCodigoWeb();

            agrupado.putIfAbsent(marca, new LinkedHashMap<>());
            agrupado.get(marca).putIfAbsent(variante, new Variante(new ArrayList<>(), new ArrayList<>()));

            Map<String, Object> lenteMap = criarLenteMapComTratamento(lente, "OD", odesf, odcil, odeixo, odadicao, visao);
            agrupado.get(marca).get(variante).getOD().add(lenteMap);
        }

        // Processar lentes OE
        for (LenteComTratamento lente : oe) {
            String marca = lente.getMarca();
            String variante = lente.getCodigoWeb();

            agrupado.putIfAbsent(marca, new LinkedHashMap<>());
            agrupado.get(marca).putIfAbsent(variante, new Variante(new ArrayList<>(), new ArrayList<>()));

            Map<String, Object> lenteMap = criarLenteMapComTratamento(lente, "OE", oeesf, oecil, oeeixo, oeadicao, visao);
            agrupado.get(marca).get(variante).getOE().add(lenteMap);
        }

        return agrupado;
    }

    /**
     * MODIFICADO: Cria mapa da lente incluindo dados de tratamento adicional
     */
    private Map<String, Object> criarLenteMapComTratamento(LenteComTratamento lente, String olho,
            double esf, double cil, int eixo, double adicao, String visao) {
        
        Map<String, Object> lenteMap = new LinkedHashMap<>();
        String descricao = lente.getDescricao();

        if ("multifocal".equalsIgnoreCase(lente.getTipo()) || "ocupacional".equalsIgnoreCase(lente.getTipo())) {
            descricao = comporDescricaoMultifocal(lente.getDescricao(), olho, esf, cil, eixo, adicao, visao);
        } else {
            descricao = comporDescricaoVisaoSimples(lente.getDescricao(), olho, esf, cil, eixo, visao);
        }

        // Dados básicos da lente
        lenteMap.put("descricao", descricao);
        lenteMap.put("codigo", lente.getIdLente());
        lenteMap.put("codigoProdutoFornecedor", lente.getCodProdFornecedor());
        lenteMap.put("codigoWeb", lente.getCodigoWeb());
        lenteMap.put("esf", lente.getEsferico());
        lenteMap.put("cil", lente.getCilindrico());
        lenteMap.put("tipo", lente.getTipo());
        lenteMap.put("familia", lente.getFamilia());
        lenteMap.put("marca", lente.getMarca());
        lenteMap.put("material", lente.getMaterial());
        lenteMap.put("tratamento", lente.getTratamento());
        lenteMap.put("antireflexo", lente.getAntireflexo());
        lenteMap.put("antiblue", lente.getAntiblue());
        lenteMap.put("residual", lente.getArResidual());
        lenteMap.put("fotossensivel", lente.getFotossensivel());
        lenteMap.put("corFoto", lente.getCorFoto());
        lenteMap.put("custo", lente.getPrecoCusto());
        lenteMap.put("venda", lente.getPrecoVenda());
        lenteMap.put("par", lente.getPrecoPar());
        lenteMap.put("minimo", lente.getPrecoMinimo());
        lenteMap.put("unidade", lente.getUnidade());
        lenteMap.put("indice", lente.getIr());
        lenteMap.put("producao", lente.getTecnicaProducao());
        lenteMap.put("diametro", lente.getDiametro());
        
        // NOVO: Dados do tratamento adicional (se houver)
        lenteMap.put("origemTratamento", lente.getOrigemTratamento());
        
        if (lente.precisaTratamentoAdicional()) {
            lenteMap.put("tratamentoAdicionalId", lente.getTratamentoAdicionalId());
            lenteMap.put("tratamentoAdicionalNome", lente.getTratamentoAdicionalNome());
            lenteMap.put("tratamentoAdicionalTipo", lente.getTratamentoAdicionalTipo());
            lenteMap.put("tratamentoAdicionalValor", lente.getTratamentoAdicionalValor());
            lenteMap.put("precoTotal", lente.getPrecoTotal());
            
            System.out.println("📦 Lente com tratamento adicional: " + lente.getMarca() + 
                " + " + lente.getTratamentoAdicionalNome() + 
                " = R$ " + lente.getPrecoTotal());
        }
        
        // NOVO: Dados de coloração (se houver)
        if (lente.temColoracao()) {
            lenteMap.put("coloracao", lente.getColoracaoNome());
            lenteMap.put("coloracaoTipo", lente.getColoracaoTipo());
            lenteMap.put("coloracaoValor", lente.getColoracaoValor());
            lenteMap.put("coloracaoHex", lente.getColoracaoHex());
            
            // Atualiza preço total incluindo coloração
            double precoAtual = lente.getPrecoTotal() > 0 ? lente.getPrecoTotal() : lente.getPrecoVenda();
            double precoComCor = precoAtual + lente.getColoracaoValor();
            lenteMap.put("precoTotal", precoComCor);
            
            System.out.println("🎨 Lente com coloração: " + lente.getMarca() + 
                " + " + lente.getColoracaoNome() + 
                " (R$ " + lente.getColoracaoValor() + ")");
        }

        return lenteMap;
    }

    private String comporDescricaoMultifocal(String descricaoBase, String lado, double esf, double cil, int eixo, double adicao, String visao) {
        DecimalFormat df = new DecimalFormat("+0.00;-0.00", new DecimalFormatSymbols(Locale.US));
        return descricaoBase + " " + lado + " " +
               df.format(esf) + " " + df.format(cil) +
               " X " + eixo +
               " ADD " + String.format(Locale.US, "%.2f", adicao) +
               (visao != null && !visao.isEmpty() ? " (" + visao + ")" : "");
    }

    private String comporDescricaoVisaoSimples(String descricaoBase, String lado, double esf, double cil, int eixo, String visao) {
        DecimalFormat df = new DecimalFormat("+0.00;-0.00", new DecimalFormatSymbols(Locale.US));
        String descricaoLimpa = limparDescricaoBase(descricaoBase);
        
        StringBuilder descricao = new StringBuilder();
        descricao.append(lado).append(" ");
        descricao.append(descricaoLimpa).append(" ");
        descricao.append(df.format(esf)).append(" ");
        descricao.append(df.format(cil));
        descricao.append(" X ").append(eixo);
        
        if (visao != null && !visao.isEmpty()) {
            descricao.append(" (").append(visao).append(")");
        }
        
        return descricao.toString();
    }
    
    private String limparDescricaoBase(String descricaoBase) {
        if (descricaoBase == null) return "";
        
        String descricaoLimpa = descricaoBase
            .replaceAll("[+-]\\d+\\.\\d+[+-]\\d+\\.\\d+/[+-]\\d+\\.\\d+[+-]\\d+\\.\\d+", "")
            .replaceAll("[+-]\\d+\\.\\d+\\s*[+-]\\d+\\.\\d+", "")
            .replaceAll("[+-]\\d+\\.\\d+", "")
            .replaceAll("\\s+", " ")
            .trim();
            
        return descricaoLimpa;
    }

    private double parseDoubleSeguro(String valor) {
        if (valor == null || valor.isEmpty()) return 0.0;
        try {
            return Double.parseDouble(valor);
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private int parseIntSeguro(String valor) {
        if (valor == null || valor.isEmpty()) return 0;
        try {
            return Integer.parseInt(valor);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private double calcularMeiaDistancia(double esf, double adicao) {
        double meiaAdicao = adicao * 0.7;
        if (adicao < 2.00) {
            meiaAdicao = Math.floor(meiaAdicao * 4) / 4.0;
        } else {
            meiaAdicao = Math.ceil(meiaAdicao * 4) / 4.0;
        }
        return esf + meiaAdicao;
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doPost(request, response);
    }
}

package br.com.vendas.servlet;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import com.google.gson.Gson;

import br.com.vendas.auxiliares.OpcoesCompleto;
import br.com.vendas.auxiliares.Variante;
import br.com.vendas.beans.LenteODeOE;
import br.com.vendas.dao.LentesDao;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Servlet SelecaoLentes
 * Busca lentes disponíveis baseado na receita e filtros
 */

public class SelecaoLentes_Proposto_pelo_Claude extends HttpServlet {

    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // IMPORTANTE: Configura JSON e charset ANTES de tudo
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        // CORS (opcional, para desenvolvimento)
        response.setHeader("Access-Control-Allow-Origin", "*");

        try {
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
            
            // Log dos parâmetros
            System.out.println("========================================");
            System.out.println("SelecaoLentes - Parâmetros recebidos:");
            System.out.println("========================================");
            System.out.println("OD: Esf=" + odesf + " Cil=" + odcil + " Eixo=" + odeixo + " Ad=" + odadicao);
            System.out.println("OE: Esf=" + oeesf + " Cil=" + oecil + " Eixo=" + oeeixo + " Ad=" + oeadicao);
            System.out.println("VISAO: " + visao);
            System.out.println("========================================");

            String olhodireito, olhoesquerdo;

            LentesDao dao = new LentesDao();
            OpcoesCompleto filtro = new OpcoesCompleto();
            String opcoes = filtro.filtro(request);
            String tipoVisao = filtro.getTipoVisao();
            
            // Se tipoVisao veio vazio do filtro, usa o parâmetro visao
            if (tipoVisao == null || tipoVisao.isEmpty()) {
                tipoVisao = visao;
            }

            if ("multifocal".equalsIgnoreCase(tipoVisao)) {
                olhodireito = filtro.converteMultifocal(odesf, odcil, odadicao);
                olhoesquerdo = filtro.converteMultifocal(oeesf, oecil, oeadicao);
            } else if ("bifocal".equalsIgnoreCase(tipoVisao)) {
                olhodireito = filtro.converteBifocal(odesf, odcil, odadicao);
                olhoesquerdo = filtro.converteBifocal(oeesf, oecil, oeadicao);
            } else if ("ocupacional".equalsIgnoreCase(tipoVisao)) {
                olhodireito = filtro.converteMultifocal(odesf, odcil, odadicao);
                olhoesquerdo = filtro.converteMultifocal(oeesf, oecil, oeadicao);
            } else if ("longe".equalsIgnoreCase(tipoVisao)) {
                olhodireito = filtro.converteFiltroCompleto(odesf, odcil);
                olhoesquerdo = filtro.converteFiltroCompleto(oeesf, oecil);
            } else if ("perto".equalsIgnoreCase(tipoVisao)) {
                olhodireito = filtro.converteFiltroCompleto(odesf + odadicao, odcil);
                olhoesquerdo = filtro.converteFiltroCompleto(oeesf + oeadicao, oecil);
            } else if ("meia_distancia".equalsIgnoreCase(tipoVisao)) {
                olhodireito = filtro.transposicao(calcularMeiaDistancia(odesf, odadicao), odcil);
                olhoesquerdo = filtro.transposicao(calcularMeiaDistancia(oeesf, oeadicao), oecil);
            } else {
                // Fallback: visão simples
                olhodireito = filtro.transposicao(odesf, odcil);
                olhoesquerdo = filtro.transposicao(oeesf, oecil);
            }

            if (!opcoes.isEmpty()) {
                olhodireito += " AND " + opcoes;
                olhoesquerdo += " AND " + opcoes;
            }
            
            System.out.println("Query OD: " + olhodireito);
            System.out.println("Query OE: " + olhoesquerdo);

            List<LenteODeOE> odLentes = buscarLentes(dao, olhodireito, "od");
            List<LenteODeOE> oeLentes = buscarLentes(dao, olhoesquerdo, "oe");

            System.out.println("OD Lentes encontradas: " + odLentes.size());
            System.out.println("OE Lentes encontradas: " + oeLentes.size());

            Map<String, Map<String, Variante>> lentesAgrupadas = 
                agruparLentes(odLentes, oeLentes, odesf, odcil, odeixo, odadicao, oeesf, oecil, oeeixo, oeadicao, visao);

            System.out.println("Total marcas: " + lentesAgrupadas.size());
            System.out.println("========================================");

            // Retorna JSON
            new Gson().toJson(lentesAgrupadas, response.getWriter());
            
        } catch (Exception e) {
            e.printStackTrace();
            
            // Retorna erro em JSON
            Map<String, Object> erro = new LinkedHashMap<>();
            erro.put("erro", true);
            erro.put("mensagem", e.getMessage());
            new Gson().toJson(erro, response.getWriter());
            
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    private List<LenteODeOE> buscarLentes(LentesDao dao, String grau, String olho) {
        try {
            return dao.getLentes(grau, olho);
        } catch (SQLException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    private Map<String, Map<String, Variante>> agruparLentes(
            List<LenteODeOE> od, List<LenteODeOE> oe,
            double odesf, double odcil, int odeixo, double odadicao,
            double oeesf, double oecil, int oeeixo, double oeadicao,
            String visao) {

        Map<String, Map<String, Variante>> agrupado = new LinkedHashMap<>();

        // Processar lentes OD
        for (LenteODeOE lente : od) {
            String marca = lente.getMarca();
            String variante = lente.getCodigoWeb(); // Usar codigoWeb como chave da variante

            agrupado.putIfAbsent(marca, new LinkedHashMap<>());
            agrupado.get(marca).putIfAbsent(variante, new Variante(new ArrayList<>(), new ArrayList<>()));

            Map<String, Object> lenteMap = criarLenteMap(lente, "OD", odesf, odcil, odeixo, odadicao, visao);
            agrupado.get(marca).get(variante).getOD().add(lenteMap);
        }

        // Processar lentes OE
        for (LenteODeOE lente : oe) {
            String marca = lente.getMarca();
            String variante = lente.getCodigoWeb(); // Usar codigoWeb como chave da variante

            agrupado.putIfAbsent(marca, new LinkedHashMap<>());
            agrupado.get(marca).putIfAbsent(variante, new Variante(new ArrayList<>(), new ArrayList<>()));

            Map<String, Object> lenteMap = criarLenteMap(lente, "OE", oeesf, oecil, oeeixo, oeadicao, visao);
            agrupado.get(marca).get(variante).getOE().add(lenteMap);
        }

        return agrupado;
    }

    private Map<String, Object> criarLenteMap(LenteODeOE lente, String olho,
            double esf, double cil, int eixo, double adicao, String visao) {
        Map<String, Object> lenteMap = new LinkedHashMap<>();
        String descricao = lente.getDescricao(); // Base da descrição

        if ("multifocal".equalsIgnoreCase(lente.getTipo()) || "ocupacional".equalsIgnoreCase(lente.getTipo())) {
            descricao = comporDescricaoMultifocal(lente.getDescricao(), olho, esf, cil, eixo, adicao, visao);
        } else {
            descricao = comporDescricaoVisaoSimples(lente.getDescricao(), olho, esf, cil, eixo, visao);
        }

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
        
        // Limpar a descrição base de possíveis valores duplicados
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
        
        // Remove padrões como +1.00-0.50/+0.50+0.50, +1.00 -0.50, etc.
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

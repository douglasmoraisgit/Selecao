package br.com.vendas.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import br.com.vendas.dao.ConnectionFactory;
import br.com.vendas.util.GsonUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * ImprimirOrcamento.java
 * Servlet para gerar página de impressão do orçamento
 * 
 * ENDPOINTS:
 * GET /ImprimirOrcamento?id=123  → Retorna HTML formatado para impressão
 * 
 * O HTML gerado pode ser:
 * - Impresso diretamente (Ctrl+P)
 * - Salvo como PDF pelo navegador
 * 
 * @author OptoFreela
 */
public class ImprimirOrcamento extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private Gson gson = GsonUtils.getGson();
    private NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));
    private SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm");
    private SimpleDateFormat dateOnlyFormat = new SimpleDateFormat("dd/MM/yyyy");

    public ImprimirOrcamento() {
        super();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/html");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        
        String idStr = request.getParameter("id");
        
        if (idStr == null || idStr.isEmpty()) {
            out.print(gerarPaginaErro("ID do orçamento não informado"));
            return;
        }
        
        try {
            long orcamentoId = Long.parseLong(idStr);
            
            System.out.println("╔════════════════════════════════════════════════════════════════╗");
            System.out.println("║  🖨️ GERANDO IMPRESSÃO DO ORÇAMENTO #" + orcamentoId);
            System.out.println("╚════════════════════════════════════════════════════════════════╝");
            
            // Busca dados do orçamento
            JsonObject orcamento = buscarOrcamento(orcamentoId);
            
            if (orcamento == null) {
                out.print(gerarPaginaErro("Orçamento #" + orcamentoId + " não encontrado"));
                return;
            }
            
            // Busca itens
            List<JsonObject> itens = buscarItens(orcamentoId);
            
            // Gera HTML
            String html = gerarHTML(orcamento, itens);
            out.print(html);
            
        } catch (NumberFormatException e) {
            out.print(gerarPaginaErro("ID inválido: " + idStr));
        } catch (Exception e) {
            System.err.println("❌ Erro ao gerar impressão: " + e.getMessage());
            e.printStackTrace();
            out.print(gerarPaginaErro("Erro ao gerar orçamento: " + e.getMessage()));
        }
    }

    /**
     * Busca dados do orçamento
     */
    private JsonObject buscarOrcamento(long id) throws SQLException {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        
        try {
            conn = ConnectionFactory.getInstance().getConnection();
            
            String sql = "SELECT * FROM orcamentos WHERE id = ?";
            stmt = conn.prepareStatement(sql);
            stmt.setLong(1, id);
            
            rs = stmt.executeQuery();
            
            if (rs.next()) {
                JsonObject orc = new JsonObject();
                orc.addProperty("id", rs.getLong("id"));
                orc.addProperty("clienteId", rs.getLong("cliente_id"));
                orc.addProperty("clienteNome", rs.getString("cliente_nome"));
                orc.addProperty("total", rs.getDouble("total"));
                orc.addProperty("status", rs.getString("status"));
                orc.addProperty("dataHora", rs.getString("data_hora"));
                orc.addProperty("observacoes", rs.getString("observacoes"));
                return orc;
            }
            
            return null;
            
        } finally {
            if (rs != null) rs.close();
            if (stmt != null) stmt.close();
            if (conn != null) conn.close();
        }
    }

    /**
     * Busca itens do orçamento
     */
    private List<JsonObject> buscarItens(long orcamentoId) throws SQLException {
        List<JsonObject> itens = new ArrayList<>();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        
        try {
            conn = ConnectionFactory.getInstance().getConnection();
            
            String sql = "SELECT * FROM orcamento_itens WHERE orcamento_id = ? ORDER BY tipo, olho";
            stmt = conn.prepareStatement(sql);
            stmt.setLong(1, orcamentoId);
            
            rs = stmt.executeQuery();
            
            while (rs.next()) {
                JsonObject item = new JsonObject();
                item.addProperty("id", rs.getString("item_id"));
                item.addProperty("tipo", rs.getString("tipo"));
                item.addProperty("codigo", rs.getInt("codigo"));
                item.addProperty("codigoWeb", rs.getString("codigo_web"));
                item.addProperty("marca", rs.getString("marca"));
                item.addProperty("familia", rs.getString("familia"));
                item.addProperty("descricao", rs.getString("descricao"));
                item.addProperty("olho", rs.getString("olho"));
                item.addProperty("quantidade", rs.getDouble("quantidade"));
                item.addProperty("precoUnitario", rs.getDouble("preco_unitario"));
                item.addProperty("precoTotal", rs.getDouble("preco_total"));
                item.addProperty("tratamentosJson", rs.getString("tratamentos_json"));
                item.addProperty("coloracaoJson", rs.getString("coloracao_json"));
                itens.add(item);
            }
            
        } finally {
            if (rs != null) rs.close();
            if (stmt != null) stmt.close();
            if (conn != null) conn.close();
        }
        
        return itens;
    }

    /**
     * Gera o HTML completo do orçamento
     */
    private String gerarHTML(JsonObject orcamento, List<JsonObject> itens) {
        StringBuilder html = new StringBuilder();
        
        String clienteNome = orcamento.get("clienteNome").getAsString();
        double total = orcamento.get("total").getAsDouble();
        String dataHora = orcamento.get("dataHora").getAsString();
        long id = orcamento.get("id").getAsLong();
        
        // Separa lentes e produtos
        List<JsonObject> lentes = new ArrayList<>();
        List<JsonObject> produtos = new ArrayList<>();
        
        for (JsonObject item : itens) {
            if ("lente".equals(item.get("tipo").getAsString())) {
                lentes.add(item);
            } else {
                produtos.add(item);
            }
        }
        
        html.append("<!DOCTYPE html>\n");
        html.append("<html lang=\"pt-BR\">\n");
        html.append("<head>\n");
        html.append("    <meta charset=\"UTF-8\">\n");
        html.append("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
        html.append("    <title>Orçamento #").append(id).append(" - ").append(clienteNome).append("</title>\n");
        html.append(getCSS());
        html.append("</head>\n");
        html.append("<body>\n");
        
        // Container principal
        html.append("<div class=\"container\">\n");
        
        // Botões de ação (não aparecem na impressão)
        html.append("    <div class=\"no-print actions\">\n");
        html.append("        <button onclick=\"window.print()\" class=\"btn btn-primary\">🖨️ Imprimir / Salvar PDF</button>\n");
        html.append("        <button onclick=\"window.close()\" class=\"btn btn-secondary\">✕ Fechar</button>\n");
        html.append("    </div>\n");
        
        // Cabeçalho
        html.append("    <header class=\"header\">\n");
        html.append("        <div class=\"logo\">\n");
        html.append("            <h1>🔬 OptoFreela</h1>\n");
        html.append("            <p>Sistema de Lentes Oftálmicas</p>\n");
        html.append("        </div>\n");
        html.append("        <div class=\"doc-info\">\n");
        html.append("            <h2>ORÇAMENTO</h2>\n");
        html.append("            <p class=\"doc-number\">#").append(String.format("%06d", id)).append("</p>\n");
        html.append("            <p class=\"doc-date\">").append(formatarData(dataHora)).append("</p>\n");
        html.append("        </div>\n");
        html.append("    </header>\n");
        
        // Dados do cliente
        html.append("    <section class=\"cliente-section\">\n");
        html.append("        <h3>📋 Dados do Cliente</h3>\n");
        html.append("        <div class=\"cliente-info\">\n");
        html.append("            <p><strong>Nome:</strong> ").append(clienteNome).append("</p>\n");
        html.append("        </div>\n");
        html.append("    </section>\n");
        
        // Tabela de lentes
        if (!lentes.isEmpty()) {
            html.append("    <section class=\"itens-section\">\n");
            html.append("        <h3>👓 Lentes Oftálmicas</h3>\n");
            html.append("        <table class=\"itens-table\">\n");
            html.append("            <thead>\n");
            html.append("                <tr>\n");
            html.append("                    <th>Olho</th>\n");
            html.append("                    <th>Descrição</th>\n");
            html.append("                    <th>Qtd</th>\n");
            html.append("                    <th>Valor Unit.</th>\n");
            html.append("                    <th>Total</th>\n");
            html.append("                </tr>\n");
            html.append("            </thead>\n");
            html.append("            <tbody>\n");
            
            for (JsonObject lente : lentes) {
                html.append(renderLinha(lente));
            }
            
            html.append("            </tbody>\n");
            html.append("        </table>\n");
            html.append("    </section>\n");
        }
        
        // Tabela de produtos
        if (!produtos.isEmpty()) {
            html.append("    <section class=\"itens-section\">\n");
            html.append("        <h3>📦 Produtos</h3>\n");
            html.append("        <table class=\"itens-table\">\n");
            html.append("            <thead>\n");
            html.append("                <tr>\n");
            html.append("                    <th>Código</th>\n");
            html.append("                    <th>Descrição</th>\n");
            html.append("                    <th>Qtd</th>\n");
            html.append("                    <th>Valor Unit.</th>\n");
            html.append("                    <th>Total</th>\n");
            html.append("                </tr>\n");
            html.append("            </thead>\n");
            html.append("            <tbody>\n");
            
            for (JsonObject produto : produtos) {
                html.append(renderLinhaProduto(produto));
            }
            
            html.append("            </tbody>\n");
            html.append("        </table>\n");
            html.append("    </section>\n");
        }
        
        // Total
        html.append("    <section class=\"total-section\">\n");
        html.append("        <div class=\"total-box\">\n");
        html.append("            <span class=\"total-label\">TOTAL DO ORÇAMENTO</span>\n");
        html.append("            <span class=\"total-value\">").append(currencyFormat.format(total)).append("</span>\n");
        html.append("        </div>\n");
        html.append("    </section>\n");
        
        // Validade
        html.append("    <section class=\"validade-section\">\n");
        html.append("        <p>⏰ <strong>Validade:</strong> Este orçamento é válido por 30 dias a partir da data de emissão.</p>\n");
        html.append("        <p>📞 <strong>Dúvidas?</strong> Entre em contato conosco.</p>\n");
        html.append("    </section>\n");
        
        // Rodapé
        html.append("    <footer class=\"footer\">\n");
        html.append("        <p>Documento gerado em ").append(dateFormat.format(new Date())).append("</p>\n");
        html.append("        <p>OptoFreela - Sistema de Gestão Óptica</p>\n");
        html.append("    </footer>\n");
        
        html.append("</div>\n");
        html.append("</body>\n");
        html.append("</html>");
        
        return html.toString();
    }

    /**
     * Renderiza linha de lente com tratamentos e coloração
     */
    private String renderLinha(JsonObject item) {
        StringBuilder html = new StringBuilder();
        
        String olho = item.has("olho") && !item.get("olho").isJsonNull() 
            ? item.get("olho").getAsString() : "";
        String descricao = item.has("descricao") && !item.get("descricao").isJsonNull() 
            ? item.get("descricao").getAsString() : "";
        String marca = item.has("marca") && !item.get("marca").isJsonNull() 
            ? item.get("marca").getAsString() : "";
        double quantidade = item.has("quantidade") ? item.get("quantidade").getAsDouble() : 0;
        double precoUnitario = item.has("precoUnitario") ? item.get("precoUnitario").getAsDouble() : 0;
        double precoTotal = item.has("precoTotal") ? item.get("precoTotal").getAsDouble() : 0;
        
        // Linha principal da lente
        html.append("                <tr class=\"item-row\">\n");
        html.append("                    <td class=\"olho-cell\"><span class=\"olho-badge ").append(olho.toLowerCase()).append("\">").append(olho).append("</span></td>\n");
        html.append("                    <td>\n");
        html.append("                        <div class=\"item-desc\">").append(descricao).append("</div>\n");
        html.append("                        <div class=\"item-marca\">").append(marca).append("</div>\n");
        html.append("                    </td>\n");
        html.append("                    <td class=\"center\">").append(quantidade).append("</td>\n");
        html.append("                    <td class=\"right\">").append(currencyFormat.format(precoUnitario)).append("</td>\n");
        html.append("                    <td class=\"right bold\">").append(currencyFormat.format(precoTotal)).append("</td>\n");
        html.append("                </tr>\n");
        
        // Tratamentos
        String tratamentosJson = item.has("tratamentosJson") && !item.get("tratamentosJson").isJsonNull() 
            ? item.get("tratamentosJson").getAsString() : null;
        
        if (tratamentosJson != null && !tratamentosJson.isEmpty()) {
            try {
                JsonParser parser = new JsonParser();
                JsonArray tratamentos = parser.parse(tratamentosJson).getAsJsonArray();
                for (JsonElement elem : tratamentos) {
                    JsonObject trat = elem.getAsJsonObject();
                    String nome = trat.has("nome") ? trat.get("nome").getAsString() : "";
                    double valor = trat.has("valor") ? trat.get("valor").getAsDouble() : 0;
                    
                    html.append("                <tr class=\"extra-row\">\n");
                    html.append("                    <td></td>\n");
                    html.append("                    <td colspan=\"3\"><span class=\"extra-tag tratamento\">💎 ").append(nome).append("</span></td>\n");
                    html.append("                    <td class=\"right extra-valor\">").append(currencyFormat.format(valor)).append("</td>\n");
                    html.append("                </tr>\n");
                }
            } catch (Exception e) {
                // Ignora erros de parse
            }
        }
        
        // Coloração
        String coloracaoJson = item.has("coloracaoJson") && !item.get("coloracaoJson").isJsonNull() 
            ? item.get("coloracaoJson").getAsString() : null;
        
        if (coloracaoJson != null && !coloracaoJson.isEmpty()) {
            try {
                JsonParser parser = new JsonParser();
                JsonObject cor = parser.parse(coloracaoJson).getAsJsonObject();
                String nome = cor.has("nome") ? cor.get("nome").getAsString() : "";
                double valor = cor.has("valor") ? cor.get("valor").getAsDouble() : 0;
                String hex = cor.has("hex") ? cor.get("hex").getAsString() : "#888";
                
                html.append("                <tr class=\"extra-row\">\n");
                html.append("                    <td></td>\n");
                html.append("                    <td colspan=\"3\"><span class=\"extra-tag coloracao\"><span class=\"cor-amostra\" style=\"background:").append(hex).append("\"></span>🎨 ").append(nome).append("</span></td>\n");
                html.append("                    <td class=\"right extra-valor\">").append(currencyFormat.format(valor)).append("</td>\n");
                html.append("                </tr>\n");
            } catch (Exception e) {
                // Ignora erros de parse
            }
        }
        
        return html.toString();
    }

    /**
     * Renderiza linha de produto
     */
    private String renderLinhaProduto(JsonObject item) {
        StringBuilder html = new StringBuilder();
        
        String codigo = item.has("codigoWeb") && !item.get("codigoWeb").isJsonNull() 
            ? item.get("codigoWeb").getAsString() : "";
        String descricao = item.has("descricao") && !item.get("descricao").isJsonNull() 
            ? item.get("descricao").getAsString() : "";
        double quantidade = item.has("quantidade") ? item.get("quantidade").getAsDouble() : 0;
        double precoUnitario = item.has("precoUnitario") ? item.get("precoUnitario").getAsDouble() : 0;
        double precoTotal = item.has("precoTotal") ? item.get("precoTotal").getAsDouble() : 0;
        
        html.append("                <tr class=\"item-row\">\n");
        html.append("                    <td class=\"center\">").append(codigo).append("</td>\n");
        html.append("                    <td>").append(descricao).append("</td>\n");
        html.append("                    <td class=\"center\">").append((int)quantidade).append("</td>\n");
        html.append("                    <td class=\"right\">").append(currencyFormat.format(precoUnitario)).append("</td>\n");
        html.append("                    <td class=\"right bold\">").append(currencyFormat.format(precoTotal)).append("</td>\n");
        html.append("                </tr>\n");
        
        return html.toString();
    }

    /**
     * Formata data do banco
     */
    private String formatarData(String dataStr) {
        try {
            SimpleDateFormat dbFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            Date data = dbFormat.parse(dataStr);
            return dateFormat.format(data);
        } catch (Exception e) {
            return dataStr;
        }
    }

    /**
     * Retorna CSS do documento
     */
    private String getCSS() {
        return """
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 12pt;
                    line-height: 1.5;
                    color: #333;
                    background: #f5f5f5;
                }
                
                .container {
                    max-width: 210mm;
                    margin: 20px auto;
                    background: white;
                    padding: 20mm;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                
                /* Ações - não imprime */
                .actions {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    padding-bottom: 20px;
                    border-bottom: 2px dashed #ddd;
                }
                
                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .btn-primary {
                    background: #6366f1;
                    color: white;
                }
                
                .btn-primary:hover {
                    background: #4f46e5;
                }
                
                .btn-secondary {
                    background: #e5e7eb;
                    color: #374151;
                }
                
                .btn-secondary:hover {
                    background: #d1d5db;
                }
                
                /* Cabeçalho */
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #6366f1;
                    margin-bottom: 30px;
                }
                
                .logo h1 {
                    font-size: 24pt;
                    color: #6366f1;
                    margin-bottom: 4px;
                }
                
                .logo p {
                    color: #6b7280;
                    font-size: 10pt;
                }
                
                .doc-info {
                    text-align: right;
                }
                
                .doc-info h2 {
                    font-size: 18pt;
                    color: #374151;
                    margin-bottom: 8px;
                }
                
                .doc-number {
                    font-size: 16pt;
                    font-weight: 700;
                    color: #6366f1;
                }
                
                .doc-date {
                    color: #6b7280;
                    margin-top: 4px;
                }
                
                /* Seções */
                section {
                    margin-bottom: 25px;
                }
                
                section h3 {
                    font-size: 12pt;
                    color: #374151;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #e5e7eb;
                    margin-bottom: 15px;
                }
                
                /* Cliente */
                .cliente-info {
                    background: #f9fafb;
                    padding: 15px;
                    border-radius: 8px;
                }
                
                /* Tabela de itens */
                .itens-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                
                .itens-table th {
                    background: #f3f4f6;
                    padding: 10px 12px;
                    text-align: left;
                    font-size: 10pt;
                    font-weight: 600;
                    color: #374151;
                    border-bottom: 2px solid #e5e7eb;
                }
                
                .itens-table td {
                    padding: 10px 12px;
                    border-bottom: 1px solid #e5e7eb;
                    vertical-align: top;
                }
                
                .item-row td {
                    background: white;
                }
                
                .extra-row td {
                    background: #fafafa;
                    padding: 6px 12px;
                    border-bottom: 1px dashed #e5e7eb;
                }
                
                .item-desc {
                    font-weight: 500;
                    color: #111827;
                }
                
                .item-marca {
                    font-size: 10pt;
                    color: #6b7280;
                    margin-top: 2px;
                }
                
                .center { text-align: center; }
                .right { text-align: right; }
                .bold { font-weight: 600; }
                
                /* Badges de olho */
                .olho-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 4px;
                    font-size: 10pt;
                    font-weight: 700;
                }
                
                .olho-badge.od {
                    background: #dbeafe;
                    color: #1d4ed8;
                }
                
                .olho-badge.oe {
                    background: #dcfce7;
                    color: #16a34a;
                }
                
                /* Extras */
                .extra-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 9pt;
                }
                
                .extra-tag.tratamento {
                    background: #ede9fe;
                    color: #7c3aed;
                }
                
                .extra-tag.coloracao {
                    background: #fce7f3;
                    color: #db2777;
                }
                
                .extra-valor {
                    font-size: 10pt;
                    color: #6b7280;
                }
                
                .cor-amostra {
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: 1px solid rgba(0,0,0,0.2);
                }
                
                /* Total */
                .total-section {
                    margin-top: 30px;
                }
                
                .total-box {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white;
                    padding: 20px 25px;
                    border-radius: 10px;
                }
                
                .total-label {
                    font-size: 12pt;
                    font-weight: 500;
                }
                
                .total-value {
                    font-size: 24pt;
                    font-weight: 700;
                }
                
                /* Validade */
                .validade-section {
                    background: #fef3c7;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #f59e0b;
                }
                
                .validade-section p {
                    font-size: 10pt;
                    color: #92400e;
                    margin-bottom: 5px;
                }
                
                .validade-section p:last-child {
                    margin-bottom: 0;
                }
                
                /* Rodapé */
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    text-align: center;
                    color: #9ca3af;
                    font-size: 9pt;
                }
                
                /* Impressão */
                @media print {
                    body {
                        background: white;
                    }
                    
                    .container {
                        margin: 0;
                        padding: 10mm;
                        box-shadow: none;
                        max-width: none;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                    
                    .header {
                        border-bottom-width: 2px;
                    }
                    
                    .total-box {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    .olho-badge, .extra-tag, .validade-section {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
                
                @page {
                    size: A4;
                    margin: 10mm;
                }
            </style>
        """;
    }

    /**
     * Gera página de erro
     */
    private String gerarPaginaErro(String mensagem) {
        return """
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Erro</title>
                <style>
                    body {
                        font-family: 'Segoe UI', sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background: #f5f5f5;
                    }
                    .error-box {
                        background: white;
                        padding: 40px;
                        border-radius: 12px;
                        text-align: center;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    }
                    .error-icon {
                        font-size: 48px;
                        margin-bottom: 16px;
                    }
                    h1 {
                        color: #dc2626;
                        margin-bottom: 8px;
                    }
                    p {
                        color: #6b7280;
                    }
                    button {
                        margin-top: 20px;
                        padding: 10px 20px;
                        background: #6366f1;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                    }
                </style>
            </head>
            <body>
                <div class="error-box">
                    <div class="error-icon">❌</div>
                    <h1>Erro</h1>
                    <p>%s</p>
                    <button onclick="window.close()">Fechar</button>
                </div>
            </body>
            </html>
        """.formatted(mensagem);
    }
}
package br.com.vendas.servlet;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;

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
import jakarta.servlet.http.HttpSession;

/**
 * SalvarVenda.java
 * Servlet para salvar venda no banco de dados
 * 
 * ✅ ATUALIZADO: Agora usa dados do usuário logado da sessão
 * 
 * ENDPOINT:
 * POST /SalvarVenda
 * 
 * DADOS DA SESSÃO UTILIZADOS:
 * - usuarioId: ID do usuário que está realizando a venda
 * - usuarioNome: Nome do vendedor
 * - lojaId: ID da loja do usuário
 * 
 * @author OptoFreela
 */
public class SalvarVenda2 extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private Gson gson = GsonUtils.getGson();

    public SalvarVenda2() {
        super();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        JsonObject resultado = new JsonObject();
        
        Connection conn = null;
        
        try {
            // ✅ NOVO: Obtém dados do usuário da sessão
            HttpSession session = request.getSession(false);
            if (session == null) {
                throw new Exception("Sessão inválida. Faça login novamente.");
            }
            
            Integer usuarioId = (Integer) session.getAttribute("usuarioId");
            String usuarioNome = (String) session.getAttribute("usuarioNome");
            Integer lojaId = (Integer) session.getAttribute("lojaId");
            
            if (usuarioId == null) {
                throw new Exception("Usuário não autenticado. Faça login novamente.");
            }
            
            // Lê o body JSON
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = request.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            
            JsonParser parser = new JsonParser();
            JsonObject dados = parser.parse(sb.toString()).getAsJsonObject();
            
            System.out.println("╔════════════════════════════════════════════════════════════════╗");
            System.out.println("║  💾 SALVANDO VENDA                                             ║");
            System.out.println("╠════════════════════════════════════════════════════════════════╣");
            System.out.println("║  👤 Usuário: " + usuarioNome + " (ID: " + usuarioId + ")");
            System.out.println("║  🏪 Loja ID: " + lojaId);
            System.out.println("╚════════════════════════════════════════════════════════════════╝");
            
            // Extrai dados
            String clienteNome = getStringOrNull(dados, "cliente_nome");
            Long idCliente = null;
            if (dados.has("id_cliente") && !dados.get("id_cliente").isJsonNull()) {
                idCliente = dados.get("id_cliente").getAsLong();
            }
            
            String clienteCpf = getStringOrNull(dados, "cliente_cpf");
            String clienteTelefone = getStringOrNull(dados, "cliente_telefone");
            double subtotal = dados.has("subtotal") ? dados.get("subtotal").getAsDouble() : 0;
            String descontoTipo = getStringOrNull(dados, "desconto_tipo");
            double descontoValor = dados.has("desconto_valor") ? dados.get("desconto_valor").getAsDouble() : 0;
            double total = dados.has("total") ? dados.get("total").getAsDouble() : 0;
            String observacoes = getStringOrNull(dados, "observacoes");
            
            JsonArray itens = dados.has("itens") ? dados.get("itens").getAsJsonArray() : new JsonArray();
            JsonArray pagamentos = dados.has("pagamentos") ? dados.get("pagamentos").getAsJsonArray() : new JsonArray();
            
            System.out.println("Cliente: " + clienteNome);
            System.out.println("Total: R$ " + total);
            System.out.println("Itens: " + itens.size());
            
            // Validações
            if (clienteNome == null || clienteNome.trim().isEmpty()) {
                throw new Exception("Nome do cliente é obrigatório");
            }
            
            if (itens.size() == 0) {
                throw new Exception("A venda deve ter pelo menos um item");
            }
            
            if (pagamentos.size() == 0) {
                throw new Exception("A venda deve ter pelo menos uma forma de pagamento");
            }
            
            // Conexão com banco
            conn = ConnectionFactory.getInstance().getConnection();
            conn.setAutoCommit(false);
            
            try {
                // 1. Gerar ID do pedido
                long idPedido = gerarIdPedido(conn);
                
                // 2. Determinar tipo de venda
                String tipoVenda = "normal";
                Long idEmpresaConvenio = null;
                String numeroAutorizacao = null;
                
                for (JsonElement elem : pagamentos) {
                    JsonObject pag = elem.getAsJsonObject();
                    String forma = getStringOrNull(pag, "forma");
                    if ("CONVENIO".equals(forma)) {
                        tipoVenda = "convenio";
                        idEmpresaConvenio = pag.has("convenio_id") && !pag.get("convenio_id").isJsonNull() 
                            ? pag.get("convenio_id").getAsLong() : null;
                        numeroAutorizacao = getStringOrNull(pag, "autorizacao");
                        break;
                    }
                }
                
                // 3. Inserir venda - ✅ ATUALIZADO: usa id_usuario e id_loja da sessão
                String sqlVenda = 
                    "INSERT INTO vendas (id_pedido, id_loja, id_usuario, data, cliente, cpf, id_cliente, vendedor, " +
                    "subtotal, desconto, desconto_tipo, total, observacoes, " +
                    "status, status_pagamento, tipo_venda, id_empresa_convenio, numero_autorizacao_convenio) " +
                    "VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendente', 'Pendente', ?, ?, ?)";
                
                long vendaId;
                try (PreparedStatement stmt = conn.prepareStatement(sqlVenda, Statement.RETURN_GENERATED_KEYS)) {
                    int idx = 1;
                    stmt.setLong(idx++, idPedido);
                    stmt.setInt(idx++, lojaId != null ? lojaId : 1);  // ✅ id_loja da sessão
                    stmt.setInt(idx++, usuarioId);                     // ✅ id_usuario da sessão
                    stmt.setString(idx++, clienteNome);
                    stmt.setString(idx++, clienteCpf);
                    
                    if (idCliente != null) {
                        stmt.setLong(idx++, idCliente);
                    } else {
                        stmt.setNull(idx++, Types.INTEGER);
                    }
                    
                    stmt.setString(idx++, usuarioNome);  // ✅ Nome do vendedor da sessão
                    stmt.setDouble(idx++, subtotal);
                    stmt.setDouble(idx++, descontoValor);
                    stmt.setString(idx++, descontoTipo != null ? descontoTipo : "valor");
                    stmt.setDouble(idx++, total);
                    stmt.setString(idx++, observacoes);
                    stmt.setString(idx++, tipoVenda);
                    
                    if (idEmpresaConvenio != null) {
                        stmt.setLong(idx++, idEmpresaConvenio);
                    } else {
                        stmt.setNull(idx++, Types.BIGINT);
                    }
                    
                    stmt.setString(idx++, numeroAutorizacao);
                    
                    stmt.executeUpdate();
                    
                    ResultSet rs = stmt.getGeneratedKeys();
                    if (rs.next()) {
                        vendaId = rs.getLong(1);
                    } else {
                        throw new Exception("Erro ao obter ID da venda");
                    }
                }
                
                System.out.println("✅ Venda inserida: ID=" + vendaId + ", Pedido=" + idPedido);
                
                // 4. Inserir itens
                // ✅ CORRIGIDO: Combina tratamentos + coloração em um único JSON
                String sqlItem = 
                    "INSERT INTO itens_venda (id_venda, id_produto, descricao, quantidade, " +
                    "preco_unitario, preco_tabela, subtotal, tratamentos, unidade, tipo) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                try (PreparedStatement stmt = conn.prepareStatement(sqlItem)) {
                    for (JsonElement elem : itens) {
                        JsonObject item = elem.getAsJsonObject();
                        
                        stmt.setLong(1, vendaId);
                        stmt.setLong(2, item.has("codigo") ? item.get("codigo").getAsLong() : 0);
                        stmt.setString(3, getStringOrNull(item, "descricao"));
                        stmt.setDouble(4, item.has("quantidade") ? item.get("quantidade").getAsDouble() : 1);
                        stmt.setDouble(5, item.has("preco_unitario") ? item.get("preco_unitario").getAsDouble() : 0);
                        stmt.setDouble(6, item.has("preco_unitario") ? item.get("preco_unitario").getAsDouble() : 0);
                        stmt.setDouble(7, item.has("preco_total") ? item.get("preco_total").getAsDouble() : 0);
                        
                        // ✅ NOVO: Combina tratamentos + coloração em um único JSON
                        String tratamentosJson = montarTratamentosJson(item);
                        if (tratamentosJson != null && !tratamentosJson.equals("[]")) {
                            stmt.setString(8, tratamentosJson);
                        } else {
                            stmt.setNull(8, Types.VARCHAR);
                        }
                        
                        stmt.setString(9, getStringOrNull(item, "unidade"));
                        stmt.setString(10, getStringOrNull(item, "tipo"));
                        
                        stmt.addBatch();
                    }
                    
                    stmt.executeBatch();
                }
                
                System.out.println("✅ " + itens.size() + " itens inseridos");
                
                // 5. Inserir pagamentos
                String sqlPagamento = 
                    "INSERT INTO venda_pagamentos (id_venda, forma_pagamento, valor, parcelas, " +
                    "bandeira, id_empresa_convenio, numero_autorizacao, status) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDENTE')";
                
                try (PreparedStatement stmt = conn.prepareStatement(sqlPagamento)) {
                    for (JsonElement elem : pagamentos) {
                        JsonObject pag = elem.getAsJsonObject();
                        
                        stmt.setLong(1, vendaId);
                        stmt.setString(2, getStringOrNull(pag, "forma"));
                        stmt.setDouble(3, pag.has("valor") ? pag.get("valor").getAsDouble() : 0);
                        stmt.setInt(4, pag.has("parcelas") ? pag.get("parcelas").getAsInt() : 1);
                        stmt.setString(5, getStringOrNull(pag, "bandeira"));
                        
                        if (pag.has("convenio_id") && !pag.get("convenio_id").isJsonNull()) {
                            stmt.setLong(6, pag.get("convenio_id").getAsLong());
                        } else {
                            stmt.setNull(6, Types.BIGINT);
                        }
                        
                        stmt.setString(7, getStringOrNull(pag, "autorizacao"));
                        
                        stmt.addBatch();
                    }
                    
                    stmt.executeBatch();
                }
                
                System.out.println("✅ " + pagamentos.size() + " pagamentos inseridos");
                
                // Commit
                conn.commit();
                
                resultado.addProperty("success", true);
                resultado.addProperty("vendaId", vendaId);
                resultado.addProperty("idPedido", idPedido);
                resultado.addProperty("message", "Venda salva com sucesso!");
                
                System.out.println("═══════════════════════════════════════════════════════════════════");
                System.out.println("✅ VENDA SALVA COM SUCESSO!");
                System.out.println("   ID: " + vendaId + " | Pedido: " + idPedido);
                System.out.println("   Vendedor: " + usuarioNome + " | Loja: " + lojaId);
                System.out.println("═══════════════════════════════════════════════════════════════════");
                
            } catch (Exception e) {
                conn.rollback();
                throw e;
            }
            
        } catch (Exception e) {
            System.err.println("❌ Erro ao salvar venda: " + e.getMessage());
            e.printStackTrace();
            
            resultado.addProperty("success", false);
            resultado.addProperty("message", "Erro ao salvar venda: " + e.getMessage());
            
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
        
        out.print(gson.toJson(resultado));
        out.flush();
    }

    /**
     * Gera próximo ID de pedido
     */
    private long gerarIdPedido(Connection conn) throws SQLException {
        String sql = "SELECT COALESCE(MAX(id_pedido), 0) + 1 FROM vendas";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            if (rs.next()) {
                return rs.getLong(1);
            }
        }
        
        return 1;
    }

    /**
     * Obtém string ou null de um JsonObject
     */
    private String getStringOrNull(JsonObject obj, String key) {
        if (obj.has(key) && !obj.get(key).isJsonNull()) {
            return obj.get(key).getAsString();
        }
        return null;
    }
    
    /**
     * ✅ Combina tratamentos + coloração em um único JSON
     * 
     * Estrutura resultante:
     * [
     *   { "tipo": "antireflexo", "codigo": 123, "nome": "Crizal Easy", "valor": 150.00 },
     *   { "tipo": "coloracao", "codigo": 456, "nome": "Marrom Degradê", "valor": 50.00, "hex": "#8B4513" }
     * ]
     */
    private String montarTratamentosJson(JsonObject item) {
        JsonArray resultado = new JsonArray();
        
        // 1. Adiciona tratamentos (usa tipo do frontend ou fallback para 'antireflexo')
        if (item.has("tratamentos") && item.get("tratamentos").isJsonArray()) {
            JsonArray tratamentos = item.get("tratamentos").getAsJsonArray();
            for (JsonElement t : tratamentos) {
                if (t.isJsonObject()) {
                    JsonObject trat = t.getAsJsonObject();
                    JsonObject novoTrat = new JsonObject();
                    
                    // Usa tipo do frontend ou fallback
                    if (trat.has("tipo") && !trat.get("tipo").isJsonNull()) {
                        novoTrat.add("tipo", trat.get("tipo"));
                    } else {
                        novoTrat.addProperty("tipo", "antireflexo");
                    }
                    
                    if (trat.has("codigo")) novoTrat.add("codigo", trat.get("codigo"));
                    if (trat.has("nome")) novoTrat.add("nome", trat.get("nome"));
                    if (trat.has("valor")) novoTrat.add("valor", trat.get("valor"));
                    
                    resultado.add(novoTrat);
                }
            }
        }
        
        // 2. Adiciona coloração (se existir)
        if (item.has("coloracao") && !item.get("coloracao").isJsonNull()) {
            JsonElement coloracaoEl = item.get("coloracao");
            
            if (coloracaoEl.isJsonObject()) {
                JsonObject coloracao = coloracaoEl.getAsJsonObject();
                JsonObject novaColoracao = new JsonObject();
                novaColoracao.addProperty("tipo", "coloracao");
                
                if (coloracao.has("nome")) novaColoracao.add("nome", coloracao.get("nome"));
                if (coloracao.has("valor")) novaColoracao.add("valor", coloracao.get("valor"));
                if (coloracao.has("hex")) novaColoracao.add("hex", coloracao.get("hex"));
                if (coloracao.has("tipo")) {
                    // Tipo da coloração (Total, Degradê) - renomeia para evitar conflito
                    novaColoracao.add("tipoColoracao", coloracao.get("tipo"));
                }
                
                resultado.add(novaColoracao);
            }
        }
        
        return gson.toJson(resultado);
    }
}

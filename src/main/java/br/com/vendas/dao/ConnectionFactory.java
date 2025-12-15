package br.com.vendas.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class ConnectionFactory {

    // Instância única da classe
    private static ConnectionFactory instance;

    // Configurações de conexão
  /*  private static final String URL = "jdbc:mysql://15.235.9.156/tictoecom_Lentes?useSSL=false=false";
    private static final String USER = "tictoecom_douglas";
    private static final String PASSWORD = "D14092013s";
*/
    private static final String URL = "jdbc:mysql://127.0.0.1/tictoecom_Lentes?useSSL=false=false";
    private static final String USER = "root";
    private static final String PASSWORD = "1234";
    // Construtor privado para evitar instância direta
    private ConnectionFactory() {
        try {
            DriverManager.registerDriver(new com.mysql.cj.jdbc.Driver());
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao registrar o driver do MySQL", e);
        }
    }

    // Método para obter a instância única
    public static synchronized ConnectionFactory getInstance() {
        if (instance == null) {
            instance = new ConnectionFactory();
        }
        return instance;
    }

    // Método para obter uma conexão
    public Connection getConnection() {
        try {
            //return DriverManager.getConnection(URL, USER, PASSWORD);
        	//	 return DriverManager.getConnection("jdbc:mysql://15.235.9.156/tictoecom_Lentes?useSSL=false","tictoecom_douglas","D14092013s");
        	  	return DriverManager.getConnection("jdbc:mysql://127.0.0.1/tictoecom_Lentes?useSSL=false","root","1234");
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao conectar ao banco de dados", e);
        }
    }

    // Método para fechar os recursos
    public static void closeResources(Connection conn, PreparedStatement stmt, ResultSet rs) {
        try {
            if (rs != null) rs.close();
            if (stmt != null) stmt.close();
            if (conn != null) conn.close();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao fechar recursos do banco de dados", e);
        }
    }
}

package br.com.vendas.auxiliares;
import java.util.List;
import java.util.Map;

public class Variante {
    private List<Map<String, Object>> OD;
    private List<Map<String, Object>> OE;

    public Variante(List<Map<String, Object>> od, List<Map<String, Object>> oe) {
        this.OD = od;
        this.OE = oe;
    }

    public List<Map<String, Object>> getOD() {
        return OD;
    }

    public List<Map<String, Object>> getOE() {
        return OE;
    }
}
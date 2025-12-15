package br.com.vendas.util;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.TypeAdapter;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;

public class GsonUtils {

    private static final DateTimeFormatter formatterDate = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter formatterDateTime = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private static final Gson gson = new GsonBuilder()
            .registerTypeAdapter(LocalDate.class, new TypeAdapter<LocalDate>() {
                @Override
                public void write(JsonWriter out, LocalDate value) throws IOException {
                    if (value != null) {
                        out.value(value.format(formatterDate));
                    } else {
                        out.nullValue();
                    }
                }

                @Override
                public LocalDate read(JsonReader in) throws IOException {
                    String str = in.nextString();
                    return LocalDate.parse(str, formatterDate);
                }
            })
            .registerTypeAdapter(LocalDateTime.class, new TypeAdapter<LocalDateTime>() {
                @Override
                public void write(JsonWriter out, LocalDateTime value) throws IOException {
                    if (value != null) {
                        out.value(value.format(formatterDateTime));
                    } else {
                        out.nullValue();
                    }
                }

                @Override
                public LocalDateTime read(JsonReader in) throws IOException {
                    String str = in.nextString();
                    return LocalDateTime.parse(str, formatterDateTime);
                }
            })
            .create();

    public static Gson getGson() {
        return gson;
    }
}

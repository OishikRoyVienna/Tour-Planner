package tourplanner.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tourplanner.backend.exception.ValidationException;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class RouteService {

    private static final Logger logger = LogManager.getLogger(RouteService.class);

    @Value("${ors.api.key}")
    private String apiKey;

    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> getRoute(String from, String to, String transportType) {
        logger.info("Fetching route from '{}' to '{}' via {}", from, to, transportType);

        String profile = toOrsProfile(transportType);

        double[] fromCoords = geocode(from);
        double[] toCoords = geocode(to);

        String url = "https://api.openrouteservice.org/v2/directions/" + profile;
        String body = String.format(
                "{\"coordinates\":[[%f,%f],[%f,%f]]}",
                fromCoords[1], fromCoords[0],
                toCoords[1], toCoords[0]
        );

        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", apiKey)
                .addHeader("Content-Type", "application/json")
                .post(RequestBody.create(body, MediaType.parse("application/json")))
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                logger.error("ORS route request failed: {}", response.code());
                throw new ValidationException("Could not calculate route. Check locations.");
            }

            String responseBody = response.body().string();
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode summary = root.path("routes").get(0).path("summary");

            double distanceMeters = summary.path("distance").asDouble();
            double durationSeconds = summary.path("duration").asDouble();

            Map<String, Object> result = new HashMap<>();
            result.put("distance", Math.round(distanceMeters / 100.0) / 10.0); // km
            result.put("estimatedTime", (int) Math.ceil(durationSeconds / 60.0)); // minutes
            result.put("routeInformation", responseBody); // full GeoJSON for Leaflet

            logger.info("Route calculated: {}km, {}min", result.get("distance"), result.get("estimatedTime"));
            return result;

        } catch (IOException e) {
            logger.error("ORS request error", e);
            throw new ValidationException("Route service unavailable: " + e.getMessage());
        }
    }

    private double[] geocode(String location) {
        String url = "https://api.openrouteservice.org/geocode/search?api_key=" + apiKey
                + "&text=" + location.replace(" ", "%20") + "&size=1";

        Request request = new Request.Builder().url(url).build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new ValidationException("Could not geocode location: " + location);
            }
            JsonNode root = objectMapper.readTree(response.body().string());
            JsonNode coords = root.path("features").get(0).path("geometry").path("coordinates");
            return new double[]{coords.get(1).asDouble(), coords.get(0).asDouble()}; // lat, lon
        } catch (IOException e) {
            throw new ValidationException("Geocoding failed for: " + location);
        }
    }

    private String toOrsProfile(String transportType) {
        return switch (transportType.toUpperCase()) {
            case "BIKE" -> "cycling-regular";
            case "HIKE", "RUNNING" -> "foot-hiking";
            default -> "driving-car";
        };
    }
}

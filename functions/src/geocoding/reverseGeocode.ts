/**
 * Reverse Geocoding Cloud Function
 * Converts coordinates to address using Geoapify API
 */

import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getGeoapifyConfig } from "../utils/config";

interface ReverseGeocodeRequest {
  latitude: number;
  longitude: number;
  lang?: string;
}

interface ReverseGeocodeResponse {
  address: {
    formatted: string;
    address_line1?: string;
    address_line2?: string;
    country?: string;
    country_code?: string;
    state?: string;
    county?: string;
    city?: string;
    postcode?: string;
    suburb?: string;
    street?: string;
    housenumber?: string;
    latitude: number;
    longitude: number;
    place_id?: string;
    plus_code?: string;
  };
  confidence?: number;
  match_type?: string;
}

const GEOAPIFY_API_BASE_URL = "https://api.geoapify.com/v1";

export const reverse_geocode = onCall<ReverseGeocodeRequest>(
  {
    region: "asia-southeast1",
  },
  async (request) => {
    try {
      const { latitude, longitude } = request.data;

      // Validate coordinates
      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        throw new HttpsError("invalid-argument", `Invalid coordinates: lat=${latitude}, lng=${longitude}`);
      }

      if (latitude < -90 || latitude > 90) {
        throw new HttpsError("invalid-argument", `Latitude out of range: ${latitude}. Must be between -90 and 90.`);
      }

      if (longitude < -180 || longitude > 180) {
        throw new HttpsError("invalid-argument", `Longitude out of range: ${longitude}. Must be between -180 and 180.`);
      }

      let apiKey: string;
      try {
        apiKey = getGeoapifyConfig();
      } catch (error) {
        console.error("Failed to get Geoapify API key:", error);
        throw new HttpsError("failed-precondition", "Geoapify API key is not configured");
      }

      // Create parameters
      // Note: Geoapify Reverse Geocoding API does not support 'lang' parameter
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString(),
        format: "json",
        apiKey: apiKey,
      });

      const url = `${GEOAPIFY_API_BASE_URL}/geocode/reverse?${params.toString()}`;

      console.log("Calling Geoapify API:", { latitude, longitude });

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unable to read error response");
        let errorData: { message?: string; error?: string } = {};
        try {
          errorData = JSON.parse(errorText) as { message?: string; error?: string };
        } catch {
          // If not JSON, use raw text
          errorData = { message: errorText };
        }
        console.error("Geoapify API error:", {
          status: response.status,
          statusText: response.statusText,
          errorText,
          errorData,
          apiKeyPrefix: apiKey ? `${apiKey.substring(0, 10)}...` : "missing",
        });
        const errorMessage = errorData.message || errorData.error || errorText || response.statusText;
        throw new HttpsError("internal", `Geoapify API error: ${response.status} ${response.statusText} - ${errorMessage}`);
      }

      const apiData = await response.json();
      console.log("Geoapify API response received");

      // Geoapify API uses results instead of features
      if (!apiData.results || apiData.results.length === 0) {
        return null;
      }

      const result = apiData.results[0];
      const props = result;

      // Use the coordinates from the request instead of from Geoapify response
      const address = {
        formatted: props.formatted || "",
        address_line1: props.address_line1,
        address_line2: props.address_line2,
        country: props.country,
        country_code: props.country_code,
        state: props.state,
        county: props.county,
        city: props.city,
        postcode: props.postcode,
        suburb: props.suburb,
        street: props.street,
        housenumber: props.housenumber,
        latitude: latitude, // Use value from request
        longitude: longitude, // Use value from request
        place_id: props.place_id,
        plus_code: props.plus_code,
      };

      const searchResult: ReverseGeocodeResponse = {
        address,
        confidence: props.rank?.popularity, // Geoapify uses popularity instead of confidence
        match_type: props.result_type,
      };

      return searchResult;
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      // Log full error details for debugging
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error("Unexpected error details:", { errorMessage, errorStack });
      throw new HttpsError("internal", `Internal server error: ${errorMessage}`);
    }
  }
);

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
    vus: 50,
    duration: "30s"
};

export default function () {
    const health = http.get("http://localhost:8080/health");

    check(health, {
        "health status is 200": (res) => res.status === 200
    });

    const instance = http.get("http://localhost:8080/instance");

    check(instance, {
        "instance status is 200": (res) => res.status === 200,
        "instance has ok true": (res) => res.json("ok") === true
    });

    sleep(0.1);
}
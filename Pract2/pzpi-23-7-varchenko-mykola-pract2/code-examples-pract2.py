import requests

def get_cloudflare_zones():

    API_TOKEN = "API_TOKEN"

    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }

    url = "https://api.cloudflare.com/client/v4/zones"

    response = requests.get(url, headers=headers)

    if response.status_code == 200:

        data = response.json()

        print("Cloudflare DNS Zones:\n")

        for zone in data["result"]:
            print(f"- {zone['name']}")

    else:
        print("Request error:")
        print(response.text)


cache = {}


def get_cached_content(url):

    if url in cache:

        print(f"[CACHE HIT] Data loaded from cache: {url}")

        return cache[url]

    print(f"[CACHE MISS] Loading data from server: {url}")

    simulated_response = f"Page content from {url}"

    cache[url] = simulated_response

    return simulated_response


def test_cache():

    url = "https://example.com"

    print("\nFirst request:")
    print(get_cached_content(url))

    print("\nSecond request:")
    print(get_cached_content(url))


class LoadBalancer:

    def __init__(self):

        self.servers = [
            "Server-1",
            "Server-2",
            "Server-3"
        ]

        self.current_index = 0

    def get_server(self):

        server = self.servers[self.current_index]

        self.current_index = (
            self.current_index + 1
        ) % len(self.servers)

        return server


def simulate_requests():

    balancer = LoadBalancer()

    print("\nRequest distribution between servers:\n")

    for request_number in range(1, 11):

        server = balancer.get_server()

        print(
            f"Request {request_number} "
            f"is processed by {server}"
        )


if __name__ == "__main__":
    # real API token is required
    # get_cloudflare_zones()

    print("CDN Cache Example")

    test_cache()

    print("\nLoad Balancer Example")

    simulate_requests()
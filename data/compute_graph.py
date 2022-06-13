from math import sqrt
import overpy
import json

buffalo = (42.8836,-78.9026,42.9048,-78.8517)
wilmington = (39.7401, -75.5698, 39.7573, -75.5503)

def get_data_for(location, name):
    """ Use the Overpass API to read in the street information for the area
        and add the requested restaurants to that data
    """

    api = overpy.Overpass()

    resulting_nodes = api.query(f"""node{str(location)};out;""")

    resulting_ways = api.query(f"""way{str(location)};out;""")

    with open(f"restaurants.json", "r") as f:
        restaurant_nodes = json.load(f)

    # we only want to keep the start and endpoints for the ways
    links = []
    seen = set()

    for way in resulting_ways.ways:
        n = str(way)
        n = n[n.index('[')+1:n.index(']')]
        nodes = [int(i) for i in n.split(",")]
        links.append((nodes[0], nodes[-1]))
        seen.add(nodes[0])
        seen.add(nodes[1])

    # now, process out the nodes to remove all of the extraneous ones
    nodes = []

    for node in resulting_nodes.nodes:
        if node.id in seen:
            nodes.append((node.id, float(node.lat), float(node.lon)))

    # next, add the restaurants to the nodes and links
    for rest in restaurant_nodes[name]:
        new_node = (rest['location'], rest['lat'], rest['lon'])
        nearest_node = _get_nearest_node_id(new_node, nodes)
        nodes.append(new_node)
        links.append((new_node[0], nearest_node))

    # output the new data as a json file
    with open(f"{name}_graph.json", "w") as f:
        f.write("{\n\"nodes\":[\n")
        for i in range(len(nodes)):
            id, lat, lon = nodes[i]
            f.write(f"\t{{\"id\": \"{id}\", \"lat\":{lat}, \"lon\":{lon} }}")
            if i != len(nodes) - 1:
                f.write(",\n")
        f.write("],\n\"edges\":[\n")
        for i in range(len(links)):
            a, b = links[i]
            f.write(f"\t{{\"a\": \"{a}\", \"b\": \"{b}\"}}")
            if i != len(links)-1:
                f.write(",\n")
        f.write("]}")

def _get_nearest_node_id(node, nodes):
    min = (nodes[0][0], _dist(node, nodes[0]))
    for i in range(1, len(nodes)):
        new_dist = _dist(node, nodes[i])
        if new_dist < min[1]:
            min = (nodes[i][0], new_dist)
    return min[0]

def _dist(a, b):
    return sqrt((a[1] - b[1])**2 + (a[2] - b[2])**2)

def main():
    get_data_for(buffalo, "buffalo")
    get_data_for(wilmington, "wilmington")

if __name__ == "__main__":
    main()

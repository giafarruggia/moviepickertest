
let movies = [];

fetch("movies.csv")
.then(response => response.text())
.then(text => {
    const rows = text.trim().split(/\r?\n/);

    movies = rows.slice(1).map(row => {
        const values = row.split(",");

        return {
            title: values[0]?.trim() || "",
            year: values[1]?.trim() || "",
            medium: values[2]?.trim() || "",
            length: parseInt(values[3]) || 0,
            vibes: (values[4] || "")
                .split("|")
                .map(v => v.trim())
                .filter(Boolean)
        };
    });

    populateMediums();
    populateVibes();
});

function populateMediums() {
    let mediums = [...new Set(movies.map(m => m.medium))].filter(Boolean).sort();
    mediums = mediums.filter(m => m !== "any medium").sort();
    const select = document.getElementById("medium");

    mediums.forEach(medium => {
        const option = document.createElement("option");
        option.value = medium;
        option.textContent = medium;
        document.getElementById("medium").appendChild(option);
        select.appendChild(option);
    });
}

function populateVibes() {
    const allVibes = [...new Set(
        movies.flatMap(movie => movie.vibes)
    )].sort();

    const container = document.getElementById("vibesContainer");

    allVibes.forEach(vibe => {
        const label = document.createElement("label");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = vibe;
        checkbox.className = "vibe-checkbox";

        label.appendChild(checkbox);
        label.append(" " + vibe);

        container.appendChild(label);
    });
}

document.getElementById("pickMovie").addEventListener("click", () => {

    const medium = document.getElementById("medium").value;
    const maxLength = parseInt(document.getElementById("length").value);

    const selectedVibes = [...document.querySelectorAll(".vibe-checkbox:checked")]
        .map(cb => cb.value);

    const filtered = movies.filter(movie => {

        const mediumMatch =
            !medium || movie.medium === medium;

    const lengthMatch =
            movie.length <= maxLength;

        const vibesMatch =
            selectedVibes.every(vibe =>
                movie.vibes.includes(vibe)
            );

        return mediumMatch && lengthMatch && vibesMatch;
    });

    const result = document.getElementById("result");

    if (filtered.length === 0) {
        result.textContent = "change your search and try again.";
        return;
    }

    const movie =
        filtered[Math.floor(Math.random() * filtered.length)];

    result.textContent =
        movie.year
            ? `${movie.title} (${movie.year})`
            : movie.title;
});

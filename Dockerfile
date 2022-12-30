FROM rustlang/rust:nightly as builder
ENV RUSTFLAGS="-C target-cpu=native"


WORKDIR /faculty_manager

RUN apt-get update && apt-get install -y cmake && apt-get clean

# This is a dummy build to get the dependencies cached.
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && \
    echo "// dummy file" > src/lib.rs && \
    cargo build && \
    rm -r src

# This is the actual build, copy in the rest of the sources
COPY . .
RUN cargo build

# Now make the runtime container
FROM debian:buster-slim

RUN apt-get update && apt-get upgrade -y && apt-get install -y ffmpeg ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /faculty_manager/target/debug/faculty_manager /usr/local/bin/faculty_manager
COPY Cargo.lock .

CMD ["/usr/local/bin/faculty_manager"]
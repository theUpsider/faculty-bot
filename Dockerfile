FROM rustlang/rust:nightly as builder
ENV RUSTFLAGS="-C target-cpu=native"


WORKDIR /faculty_manager

RUN apt-get update && apt-get install -y cmake && apt-get clean

# This is a dummy build to get the dependencies cached.
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && \
    echo "// dummy file" > src/lib.rs && \
    cargo build --release && \
    rm -r src

# This is the actual build, copy in the rest of the sources
COPY . .
RUN cargo build --release

# Now make the runtime container
FROM debian:buster-slim

# Install graphics-/imagemagick
RUN apt-get update && apt-get upgrade -y && apt-get install -y graphicsmagick imagemagick ghostscript && rm -rf /var/lib/apt/lists/*
# allow ghostscript to convert pdf to png
RUN  mv /etc/ImageMagick-6/policy.xml /etc/ImageMagick-6/policy.xml.off

COPY --from=builder /faculty_manager/target/release/faculty_manager /usr/local/bin/faculty_manager
# copy config and env files
COPY Cargo.lock /

CMD ["/usr/local/bin/faculty_manager"]
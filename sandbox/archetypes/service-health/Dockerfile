FROM ubuntu:22.04

ENV container=docker
ENV DEBIAN_FRONTEND=noninteractive
ARG BENCH_PUBLIC_KEY
ARG SERVICE_NAME=status-beacon
ARG SERVICE_PORT=8080
ARG HEALTH_PATH=/health

COPY archetypes/common/setup-base.sh /tmp/setup-base.sh
RUN chmod +x /tmp/setup-base.sh && /tmp/setup-base.sh "$BENCH_PUBLIC_KEY"

RUN install -d -m 755 /opt/${SERVICE_NAME} /opt/hackathon
COPY archetypes/service-health/status_service.py /opt/${SERVICE_NAME}/service.py
COPY archetypes/service-health/status.service.template /tmp/status.service.template
COPY archetypes/service-health/break.sh.template /opt/hackathon/break.sh
COPY archetypes/service-health/public-test.sh.template /opt/hackathon/public-test.sh
COPY archetypes/service-health/case.json.template /opt/hackathon/case.json

RUN sed -i "s|__SERVICE_NAME__|${SERVICE_NAME}|g; s|__SERVICE_PORT__|${SERVICE_PORT}|g; s|__HEALTH_PATH__|${HEALTH_PATH}|g" \
      /tmp/status.service.template /opt/hackathon/break.sh /opt/hackathon/public-test.sh /opt/hackathon/case.json \
  && mv /tmp/status.service.template /etc/systemd/system/${SERVICE_NAME}.service \
  && chmod +x /opt/hackathon/break.sh /opt/hackathon/public-test.sh \
  && systemctl enable ${SERVICE_NAME}.service

STOPSIGNAL SIGRTMIN+3
CMD ["/sbin/init"]

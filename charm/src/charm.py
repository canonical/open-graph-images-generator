#!/usr/bin/env python3
# Copyright 2025 goulin
# See LICENSE file for licensing details.

"""Go Charm entrypoint."""

import logging
import typing

import ops

import paas_charm.go
from paas_charm.app import App

logger = logging.getLogger(__name__)


class CustomApp(App):
    def __init__(self, *args: typing.Any, **kwargs: typing.Any) -> None:
        super().__init__(*args, **kwargs)

    def gen_environment(self) -> dict[str, str]:
        env = super().gen_environment()
        # remove APP_ prefix from env keys
        env = {k.removeprefix("APP_"): v for k, v in env.items()}
        return env


class OpenGraphImagesGeneratorCharm(paas_charm.go.Charm):
    """Go Charm service."""

    def __init__(self, *args: typing.Any) -> None:
        """Initialize the instance.

        Args:
            args: passthrough to CharmBase.
        """
        super().__init__(*args)

    def _create_app(self) -> App:
        charm_state = self._create_charm_state()
        return CustomApp(
            container=self._container,
            charm_state=charm_state,
            workload_config=self._workload_config,
            database_migration=self._database_migration,
        )


if __name__ == "__main__":
    ops.main(OpenGraphImagesGeneratorCharm)

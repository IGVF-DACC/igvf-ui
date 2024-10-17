from aws_cdk import Stack

from constructs import Construct

from infrastructure.config import Config

from infrastructure.constructs.redis import Redis
from infrastructure.constructs.redis import RedisProps

from infrastructure.constructs.existing.types import ExistingResourcesClass

from infrastructure.multiplexer import MultiplexerConfig
from infrastructure.multiplexer import Multiplexer

from typing import Any
from typing import Dict
from typing import List
from typing import Type

from dataclasses import dataclass


@dataclass
class RedisConfig:
    construct_id: str
    on: bool
    props: Dict[str, Any]


class RedisStack(Stack):

    multiplexer: Multiplexer

    def __init__(
            self,
            scope: Construct,
            construct_id: str,
            *,
            config: Config,
            existing_resources_class: ExistingResourcesClass,
            **kwargs: Any
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)
        self.config = config
        self.existing_resources = existing_resources_class(
            self,
            'ExistingResources',
        )
        self.multiplexer_configs: List[MultiplexerConfig] = []
        self._define_multiplexer_configs()
        self._define_multiplexer()

    def _get_redis_config(self, cluster: Dict[str, Any]) -> RedisConfig:
        return RedisConfig(
            **cluster
        )

    def _get_redis_props(self, redis_config: RedisConfig) -> RedisProps:
        return RedisProps(
            **redis_config.props,
            config=self.config,
            existing_resources=self.existing_resources,
        )

    def _define_multiplexer_configs(self) -> None:
        for cluster in self.config.redis['clusters']:
            redis_config = self._get_redis_config(
                cluster,
            )
            redis_props = self._get_redis_props(
                redis_config,
            )
            multiplexer_config = MultiplexerConfig(
                construct_id=redis_config.construct_id,
                on=redis_config.on,
                construct_class=Redis,
                kwargs={
                    'props': redis_props,
                }
            )
            self.multiplexer_configs.append(multiplexer_config)

    def _define_multiplexer(self) -> None:
        self.multiplexer = Multiplexer(
            scope=self,
            configs=self.multiplexer_configs,
        )

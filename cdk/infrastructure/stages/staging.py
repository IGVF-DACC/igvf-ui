from aws_cdk import Stage

from constructs import Construct

from infrastructure.constructs.existing import igvf_staging

from infrastructure.config import Config

from infrastructure.stacks.redis import RedisStack
from infrastructure.stacks.frontend import FrontendStack

from infrastructure.tags import add_tags_to_stack

from typing import Any


class StagingDeployStage(Stage):

    def __init__(
            self,
            scope: Construct,
            construct_id: str,
            *,
            config: Config,
            **kwargs: Any
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)
        self.redis_stack = RedisStack(
            self,
            'RedisStack',
            config=config,
            existing_resources_class=igvf_staging.Resources,
            env=igvf_staging.US_WEST_2,
        )
        self.frontend_stack = FrontendStack(
            self,
            'FrontendStack',
            config=config,
            existing_resources_class=igvf_staging.Resources,
            redis_multiplexer=self.redis_stack.multiplexer,
            env=igvf_staging.US_WEST_2,
        )
        add_tags_to_stack(self.redis_stack, config)
        add_tags_to_stack(self.frontend_stack, config)

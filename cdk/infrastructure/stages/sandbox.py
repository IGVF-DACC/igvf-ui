from aws_cdk import Stage

from constructs import Construct

from infrastructure.constructs.existing import igvf_sandbox

from infrastructure.config import Config

from infrastructure.stacks.redis import RedisStack
from infrastructure.stacks.frontend import FrontendStack

from infrastructure.tags import add_tags_to_stack

from typing import Any


class SandboxDeployStage(Stage):

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
            existing_resources_class=igvf_sandbox.Resources,
            env=igvf_sandbox.US_WEST_2,
        )
        self.frontend_stack = FrontendStack(
            self,
            'FrontendStack',
            config=config,
            existing_resources_class=igvf_sandbox.Resources,
            redis_multiplexer=self.redis_stack.multiplexer,
            env=igvf_sandbox.US_WEST_2,
        )
        add_tags_to_stack(self.redis_stack, config)
        add_tags_to_stack(self.frontend_stack, config)

from aws_cdk import Stack

from constructs import Construct

from infrastructure.config import Config

from infrastructure.constructs.pipeline import DemoDeploymentPipeline
from infrastructure.constructs.pipeline import DemoDeploymentPipelineProps

from infrastructure.constructs.existing.types import ExistingResourcesClass

from typing import Any
from typing import Dict
from typing import Union
from typing import List
from typing import Type


class DemoDeploymentPipelineStack(Stack):

    def __init__(
            self,
            scope: Construct,
            construct_id: str,
            *,
            existing_resources_class: ExistingResourcesClass,
            config: Config,
            **kwargs: Any
    ) -> None:
        super().__init__(scope, construct_id,  **kwargs)
        self.existing_resources = existing_resources_class(
            self,
            'ExistingResources',
        )
        self.pipeline = DemoDeploymentPipeline(
            self,
            'DemoDeploymentPipeline',
            props=DemoDeploymentPipelineProps(
                github_repo='IGVF-DACC/igvf-ui',
                existing_resources=self.existing_resources,
                config=config,
            )
        )


PipelineStackClass = Union[Type[DemoDeploymentPipelineStack]]


pipeline_stacks: List[PipelineStackClass] = [
    DemoDeploymentPipelineStack,
]

name_to_pipeline_stack_map: Dict[str, PipelineStackClass] = {
    pipeline_stack.__name__: pipeline_stack
    for pipeline_stack in pipeline_stacks
}


def pipeline_stack_factory(name: str) -> PipelineStackClass:
    return name_to_pipeline_stack_map[name]

import pytest

import aws_cdk as core
import aws_cdk.assertions as assertions

from infrastructure.stacks.pipeline import DemoDeploymentPipelineStack


def test_stacks_pipeline_demo_deployment_pipeline_stack_initialized(config):
    from infrastructure.constructs.existing import igvf_dev
    app = core.App()
    stack = DemoDeploymentPipelineStack(
        app,
        'CDStack',
        existing_resources_class=igvf_dev.Resources,
        config=config,
        env=igvf_dev.US_WEST_2,
    )
    template = assertions.Template.from_stack(stack)
    template.resource_count_is(
        'AWS::CodePipeline::Pipeline',
        1
    )
    code_pipeline_resource = template.find_resources(
        'AWS::CodePipeline::Pipeline'
    )
    stages = code_pipeline_resource.get(
        'DemoDeploymentPipelineFF963331'
    ).get(
        'Properties'
    ).get(
        'Stages'
    )
    expected = [
        'Source',
        'Build',
        'UpdatePipeline',
        'Assets',
        'igvf-ui-some-branch-DeployDevelopment'
    ]
    actual = [stage['Name'] for stage in stages]
    assert len(stages) == 5

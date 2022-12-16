import pytest

import aws_cdk as core
import aws_cdk.assertions as assertions


def test_stacks_pipeline_demo_deployment_pipeline_stack_initialized(pipeline_config):
    from infrastructure.stacks.pipeline import DemoDeploymentPipelineStack
    from infrastructure.constructs.existing import igvf_dev
    app = core.App()
    stack = DemoDeploymentPipelineStack(
        app,
        'CDStack',
        existing_resources_class=igvf_dev.Resources,
        config=pipeline_config,
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
        'igvf-ui-some-branch-DemoDeployStage',
    ]
    actual = [stage['Name'] for stage in stages]
    for e in expected:
        assert e in actual
    assert len(stages) == 5


def test_stacks_pipeline_dev_deployment_pipeline_stack_initialized(pipeline_config):
    from infrastructure.stacks.pipeline import DevDeploymentPipelineStack
    from infrastructure.constructs.existing import igvf_dev
    app = core.App()
    stack = DevDeploymentPipelineStack(
        app,
        'DevDeploymentPipelineStack',
        existing_resources_class=igvf_dev.Resources,
        config=pipeline_config,
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
        'DevDeploymentPipeline4E426F0F'
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
        'igvf-ui-some-branch-DevelopmentDeployStage',
    ]
    actual = [stage['Name'] for stage in stages]
    for e in expected:
        assert e in actual
    assert len(stages) == 5


def test_stacks_pipeline_production_deployment_pipeline_stack_initialized(production_pipeline_config):
    from infrastructure.stacks.pipeline import ProductionDeploymentPipelineStack
    from infrastructure.constructs.existing import igvf_dev
    app = core.App()
    stack = ProductionDeploymentPipelineStack(
        app,
        'ProductionDeploymentPipelineStack',
        existing_resources_class=igvf_dev.Resources,
        config=production_pipeline_config,
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
        'ProductionDeploymentPipelineE21CAFC5',
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
        'igvf-ui-some-branch-StagingDeployStage',
        'ProductionAndSandboxDeployWave',
    ]
    actual = [stage['Name'] for stage in stages]
    for e in expected:
        assert e in actual
    assert len(stages) == 6

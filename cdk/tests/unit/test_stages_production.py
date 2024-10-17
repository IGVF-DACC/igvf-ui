import pytest


def test_stages_production_initialize_production_stages(config):
    from aws_cdk import App
    from infrastructure.stages.production import ProductionDeployStage
    app = App()
    production_deploy_stage = ProductionDeployStage(
        app,
        'TestProductionDeployStage',
        config=config,
    )
    cloud_assembly = production_deploy_stage.synth()
    assert [
        stack.stack_name
        for stack in cloud_assembly.stacks
    ] == [
        'TestProductionDeployStage-RedisStack',
        'TestProductionDeployStage-FrontendStack',
    ]
    stack = cloud_assembly.get_stack_by_name(
        'TestProductionDeployStage-FrontendStack',
    )
    for stack in cloud_assembly.stacks:
        assert stack.tags

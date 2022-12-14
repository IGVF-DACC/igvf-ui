import pytest


def test_stages_demo_initialize_demo_stages(config):
    from aws_cdk import App
    from infrastructure.stages.demo import DemoDeployStage
    app = App()
    demo_deploy_stage = DemoDeployStage(
        app,
        'TestDemoDeployStage',
        config=config,
    )
    cloud_assembly = demo_deploy_stage.synth()
    assert [
        stack.stack_name
        for stack in cloud_assembly.stacks
    ] == [
        'TestDemoDeployStage-FrontendStack',
    ]
    stack = cloud_assembly.get_stack_by_name(
        'TestDemoDeployStage-FrontendStack',
    )
    assert stack.tags

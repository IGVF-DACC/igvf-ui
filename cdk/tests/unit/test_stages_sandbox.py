import pytest


def test_stages_sandbox_initialize_sandbox_stages(config):
    from aws_cdk import App
    from infrastructure.stages.sandbox import SandboxDeployStage
    app = App()
    sandbox_deploy_stage = SandboxDeployStage(
        app,
        'TestSandboxDeployStage',
        config=config,
    )
    cloud_assembly = sandbox_deploy_stage.synth()
    assert [
        stack.stack_name
        for stack in cloud_assembly.stacks
    ] == [
        'TestSandboxDeployStage-RedisStack',
        'TestSandboxDeployStage-FrontendStack',
    ]
    stack = cloud_assembly.get_stack_by_name(
        'TestSandboxDeployStage-FrontendStack',
    )
    for stack in cloud_assembly.stacks:
        assert stack.tags
